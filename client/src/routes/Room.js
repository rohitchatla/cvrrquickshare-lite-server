import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import streamSaver from "streamsaver";

import Lottie from "react-lottie";
import anim0 from "../assets/lotties/5680-mail-icon.json";
import anim1 from "../assets/lotties/11143-sending-mail.json";
import anim2 from "../assets/lotties/7679-sending-success.json";
import anim3 from "../assets/lotties/25081-sending.json";

import "../css/style.css";

import axios from "axios";
import Base64Downloader from "react-base64-downloader";

const anim00 = {
  loop: true,
  autoplay: true,
  animationData: anim0,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const anim11 = {
  loop: true,
  autoplay: true,
  animationData: anim1,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const anim22 = {
  loop: true,
  autoplay: true,
  animationData: anim2,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const anim33 = {
  loop: true,
  autoplay: true,
  animationData: anim3,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const Container = styled.div`
  padding: 20px;
  display: flex;
  height: 100vh;
  width: 90%;
  margin: auto;
  flex-wrap: wrap;
`;

const worker = new Worker("../worker.js");

const Room = (props) => {
  const [connectionEstablished, setConnection] = useState(false);
  const [file, setFile] = useState();
  const [gotFile, setGotFile] = useState(false);

  const chunksRef = useRef([]);
  const socketRef = useRef();
  const peersRef = useRef([]);
  const peerRef = useRef();
  const fileNameRef = useRef("");

  const roomID = props.match.params.roomID;
  const [videoSrc, setvideoSrc] = useState("");
  const [audioSrc, setaudioSrc] = useState("");

  const [fileData, setFileData] = useState({});
  const [originalImg, setOriginalImg] = useState("");
  const [decryptDone, setDecryptDone] = useState(false);

  useEffect(() => {
    socketRef.current = io.connect(
      "https://cvrrquickshare-simple-lite.herokuapp.com"
    ); // "/"" "https://cvrrquickshare-simple-lite.herokuapp.com"
    socketRef.current.emit("join room", roomID);
    socketRef.current.on("all users", (users) => {
      peerRef.current = createPeer(users[0], socketRef.current.id);
    });

    socketRef.current.on("user joined", (payload) => {
      peerRef.current = addPeer(payload.signal, payload.callerID);
    });

    socketRef.current.on("receiving returned signal", (payload) => {
      peerRef.current.signal(payload.signal);
      setConnection(true);
    });

    socketRef.current.on("room full", () => {
      alert("room is full");
    });
  }, []);

  function createPeer(userToSignal, callerID) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    peer.on("data", handleReceivingData);

    return peer;
  }

  function addPeer(incomingSignal, callerID) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.on("data", handleReceivingData);

    peer.signal(incomingSignal);
    setConnection(true);
    return peer;
  }
  const fileChunks = [];

  /* Dynamic Hybrid switching/routing(Dynamicsism)-->done */

  function hybridReceivingData(data) {
    if (data.toString().includes("withoutchunking")) {
      console.log("Receiver w/o chunking");
      if (data.toString().includes("done")) {
        setGotFile(true);
        const parsed = JSON.parse(data);
        fileNameRef.current = parsed.fileName;
        console.log(fileNameRef.current);
        //window.location.reload(); //multiple duplicate prob::as if we send 1 file-->download then later again send same file(w/o selecting/(or) with selecting or so) 2 files comes in download(not shows in console though) so on.....(but gives error --> events.js:142 Uncaught Error: Unhandled error. (undefined)
        // at Peer.emit (events.js:142)
        // at index.js:471)
        return;
      } else {
        worker.postMessage(data);
      }
    }
    //if (data.toString().includes("withchunking")) {
    if (data.toString().includes("done")) {
      //with chuncking
      console.log("Receiver w chunking");
      //data.toString() === "done!"
      // Once, all the chunks are received, combine them to form a Blob
      const file = new Blob(fileChunks);
      console.log("Received", file);
      const parsed = JSON.parse(data);
      fileNameRef.current = parsed.fileName;
      // Download the received file using downloadjs
      console.log(fileNameRef.current);
      //download(file, `${fileNameRef.current}`); //'test.png'

      setGotFile(true);
      //window.location.reload();
      return;
      // const parsed = JSON.parse(data);
      // fileNameRef.current = parsed.fileName;
    } else {
      // Keep appending various file chunks
      fileChunks.push(data);
      worker.postMessage(data);
    }
    //}
  }
  function handleReceivingData(data) {
    /*For file less than 50kb & w/o chunking */

    /**********************************************************************************************************************************/
    if (data.toString().includes("withoutchunking")) {
      console.log("Receiver w/o chunking");
      if (data.toString().includes("done")) {
        setGotFile(true);
        const parsed = JSON.parse(data);
        console.log(parsed);
        setFileData(parsed.filedata);
        fileNameRef.current = parsed.fileName;
        console.log(fileNameRef.current);

        return;
      } else {
        worker.postMessage(data);
      }
    }
    //if (data.toString().includes("withchunking")) {
    if (data.toString().includes("done")) {
      //as need to check for every chunk so no checking for "withchunking" can send that with first packet and(&) loop through till last packets("done")
      //with chuncking
      console.log("Receiver w chunking");
      //data.toString() === "done!"
      // Once, all the chunks are received, combine them to form a Blob
      const file = new Blob(fileChunks);
      console.log("Received", file);
      const parsed = JSON.parse(data);
      fileNameRef.current = parsed.fileName;
      // Download the received file using downloadjs
      console.log(fileNameRef.current);

      setGotFile(true);

      return;
    } else {
      // Keep appending various file chunks
      fileChunks.push(data);
      worker.postMessage(data);
    }
    //}
  }

  function download() {
    setGotFile(false);
    worker.postMessage("download");
    worker.addEventListener("message", (event) => {
      const stream = event.data.stream();
      const fileStream = streamSaver.createWriteStream(fileNameRef.current);
      stream.pipeTo(fileStream);
    });
  }

  function selectFile(e) {
    setFile(e.target.files[0]);
  }

  function hybridsendFile() {
    const peer = peerRef.current;
    const stream = file.stream();
    const reader = stream.getReader();
    if (Math.abs(file.size / 1000) < 50) {
      //Math.floor()
      //less than 50kb
      /* w/o chuncking sending files(less than 50kb) & Sending more than 50kb files */
      console.log("Sender w/o chunking");
      file.arrayBuffer().then((buffer) => {
        // Off goes the file!
        peer.send(buffer);
        peer.write(
          JSON.stringify({
            withoutchunking: true,
            done: true,
            fileName: file.name,
          })
        );
      });
    } else {
      //more than 50kb
      /* Sending more than 50kb files spliting in chunks(with chuncking) */
      // We convert the file from Blob to ArrayBuffer
      console.log("Sender w chunking");
      file.arrayBuffer().then((buffer) => {
        /**
         * A chunkSize (in Bytes) is set here
         * I have it set to 16KB
         */
        const chunkSize = 16 * 1024;

        // Keep chunking, and sending the chunks to the other peer
        while (buffer.byteLength) {
          const chunk = buffer.slice(0, chunkSize);
          buffer = buffer.slice(chunkSize, buffer.byteLength);

          // Off goes the chunk!
          peer.send(chunk);
        }

        peer.send(
          JSON.stringify({
            done: true,
            fileName: file.name,
            withchunking: true,
          })
        );
      });
    }
  }

  function getBase64(file, cb) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      cb(reader.result);
    };
    reader.onerror = function (error) {
      console.log("Error: ", error);
    };
  }

  function decrypt() {
    console.log(fileData);
    axios
      .post(`http://localhost:5000/decryption`, {
        fileData,
      })
      .then((response) => {
        console.log(response.data);
        setOriginalImg(
          response.data.original.substring(2, response.data.original.length - 1)
        );
        setDecryptDone(true);
        setGotFile(false);
      });

    // fetch("http://localhost:5000/decryption", {
    //   method: "post",
    //   body: fileData,
    // }).then(function (response) {
    //   console.log(response.data);
    // });
  }

  function sendFile() {
    console.log(Math.abs(file.size / 1000));

    /**********************************************************************************************************************************/
    const peer = peerRef.current;
    const stream = file.stream();
    const reader = stream.getReader();
    if (Math.abs(file.size / 1000) < 50) {
      //Math.floor()
      //less than 50kb
      /* w/o chuncking sending files(less than 50kb) & Sending more than 50kb files */
      console.log("Sender w/o chunking");
      console.log(file);

      getBase64(file, (result) => {
        //console.log(result);
        axios
          .post(`http://localhost:5000/encryption`, {
            img: result.substring(result.indexOf(",") + 1),
          })
          .then((response) => {
            console.log(response.data);

            file.arrayBuffer().then((buffer) => {
              // Off goes the file!

              console.log(buffer);
              peer.send(buffer);
              peer.write(
                JSON.stringify({
                  withoutchunking: true,
                  done: true,
                  fileName: file.name,
                  filedata: response.data,
                })
              );
            });
          });

        // fetch("http://localhost:5000/encryption", {
        //   method: "post",
        //   body: { img: result.substring(result.indexOf(",") + 1) },
        // }).then(function (response) {
        //   console.log(response.data);
        // });
      });
    } else {
      //more than 50kb
      /* Sending more than 50kb files spliting in chunks(with chuncking) */
      // We convert the file from Blob to ArrayBuffer
      console.log("Sender w chunking");
      file.arrayBuffer().then((buffer) => {
        /**
         * A chunkSize (in Bytes) is set here
         * I have it set to 16KB
         */
        const chunkSize = 16 * 1024;

        // Keep chunking, and sending the chunks to the other peer
        while (buffer.byteLength) {
          const chunk = buffer.slice(0, chunkSize);
          buffer = buffer.slice(chunkSize, buffer.byteLength);

          // Off goes the chunk!
          peer.send(chunk);
        }

        peer.send(
          JSON.stringify({
            done: true,
            fileName: file.name,
            withchunking: true,
          })
        );
      });
    }
  }

  let body;
  if (connectionEstablished) {
    body = (
      <div>
        <input onChange={selectFile} type="file" />
        <button onClick={sendFile}>Send file</button>
        {/* <div className="blank"></div> */}
        <div className="">
          <Lottie options={anim33} />
        </div>
      </div>
    );
  } else {
    body = (
      <div>
        <div className="blank"></div>
        <h1>
          --Connection establishing with Central....-- Once you have a
          connection(p2p), you will be able to share files
        </h1>
        {/* room */}
        <div className="">
          {/* w-full md:w-1/2 md:p-12 */}
          <Lottie options={anim11} />
        </div>
      </div>
    );
  }

  let downloadPrompt, decryptPrompt;
  if (gotFile) {
    decryptPrompt = (
      <div>
        <span>
          You have received a file from a Central. Would you like to decrypt the
          file?
        </span>

        <div className="">
          <Lottie options={anim22} />
        </div>
        <button onClick={download}>Yes</button>
        <button onClick={decrypt}>Decrypt</button>
      </div>
    );
  }

  if (decryptDone) {
    downloadPrompt = (
      <div>
        <span>
          You have Decrypted the file. Would you like to download the file?
        </span>
        <div className="">
          <Lottie options={anim22} />
        </div>
        <Base64Downloader
          base64={"data:image/png;base64," + originalImg}
          //downloadName="1x1_red_pixel"
          Tag="a"
          extraAttributes={{ href: "javascript:;" }}
          //className="my-class-name"
          style={{ color: "orange" }}
          onDownloadSuccess={() => {
            setDecryptDone(false);
          }}
          onDownloadError={() => console.warn("Download failed to start")}
        >
          Download
        </Base64Downloader>
      </div>
    );

    /*
           var a = document.createElement("a"); //Create <a>
          a.href = "data:image/png;base64," + ImageBase64; //Image Base64 Goes here
          a.download = "Image.png"; //File name Here
          a.click(); //Downloaded file
    */
  }

  return (
    <Container>
      {body}
      {decryptPrompt}
      {downloadPrompt}
    </Container>
  );
};

export default Room;
