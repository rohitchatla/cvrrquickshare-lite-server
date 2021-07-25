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

    // simple original one(less than 50kb)
    // if (data.toString().includes("done")) {
    //   setGotFile(true);
    //   const parsed = JSON.parse(data);
    //   fileNameRef.current = parsed.fileName;
    // } else {
    //   worker.postMessage(data);
    // }

    // Convert the file back to Blob // (common for both with and(&) without chunking using non simple original one )
    //const file = new Blob([data]);
    //console.log("Received", file);
    // Download the received file using downloadjs
    //download(file, "test.png");

    /*For file more than 50mb & with chunking */
    // if (data.toString().includes("init")) {
    //   const parsed = JSON.parse(data);
    //   fileNameRef.current = parsed.fileName;
    //   console.log(parsed);
    // }

    //hybridReceivingData(data);// calling a function inside this function can slow done the performance and file after selecting not showing immediately if code is called from hybrid module, writting code in here can fast and shows up file quickly

    // if (data.toString().includes("done")) {
    //   //data.toString() === "done!"
    //   // Once, all the chunks are received, combine them to form a Blob
    //   const file = new Blob(fileChunks);
    //   console.log("Received", file);
    //   const parsed = JSON.parse(data);
    //   fileNameRef.current = parsed.fileName;
    //   // Download the received file using downloadjs
    //   console.log(fileNameRef.current);
    //   //download(file, `${fileNameRef.current}`); //'test.png'

    //   setGotFile(true);
    //   // const parsed = JSON.parse(data);
    //   // fileNameRef.current = parsed.fileName;
    // } else {
    //   // Keep appending various file chunks
    //   fileChunks.push(data);
    //   worker.postMessage(data);
    // }
    /**********************************************************************************************************************************/
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

        //* video.src=file //or using websockets getting name and searching in db(local,live) and sharing the same with other end user's/group from one user(music app sharing songs to hear same song 2 or more person), songs sending/selecting(like for memes like or replacement for stickers to express feelings/thoughts for the message instead of text play music entirely or bit of music.). both listening at the same time same timeline in songs with lyrics in chatting apps.Notifications for all functions & apps.sharing playlists, fitness/foods-eating tracking.
        //* audio.src=file
        //setvideoSrc(parsed)//with notbool or with bool var.
        //setaudioSrc(parsed)

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
      //download(file, `${fileNameRef.current}`); //'test.png'

      setGotFile(true);
      //window.location.reload();

      //* video.src=file //or using websockets getting name and searching in db(local,live) and sharing the same with other end user's/group from one user(music app sharing songs to hear same song 2 or more person), songs sending/selecting(like for memes like or replacement for stickers to express feelings/thoughts for the message instead of text play music entirely or bit of music.). both listening at the same time same timeline in songs with lyrics in chatting apps.Notifications for all functions & apps.sharing playlists, fitness/foods-eating tracking.
      //* audio.src=file
      //setvideoSrc(parsed)//with notbool or with bool var.
      //setaudioSrc(parsed)

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
        //file = "";//assignment to constant error
        //setFile("");//not working just reload sender,receiver so multiple duplicate prob not comes
        //return;
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

        //peer.send(JSON.stringify({ init: true, fileName: file.name }));

        // End message to signal that all chunks have been sent
        //peer.send("done!");
        peer.send(
          JSON.stringify({
            done: true,
            fileName: file.name,
            withchunking: true,
          })
        );
        //file = "";//assignment to constant error
        //setFile("");//not working just reload sender,receiver so multiple duplicate prob not comes
        //return;
      });
    }
  }

  /*can send a file(video,audio,pic,etc) and(&) can render that into video/audio/image/,etc html tag as per file type(use receiver side code(need to send file to reciver with name & type,etc) and fetch file/blob and(&) add in respective tag's src,etc) so that receivers can see directly w or w/o downloading like live streaming,etc */
  /*live streaming with db's url or files fetching or by screensharing or by above method one,etc*/
  /*can add loader with % transferred from sender 2 receiver vice-versa(receiver 2 sender), can be done by sending file size or calculating and(&) sending(what so ever) and no. of chunks(also, can be) by chunk size dividing and rendering loader updation % when each chunk is received,etc*/
  /*multiple videos tags with src from db's, or render dynamically diff videos in src like live streamming using db's or p2p adding to src attribute(with/without multiple videos tags), etc*/
  /*can use web cam,external cam, obs virtual cam/,etc as alter. vids src's for all type of combinations with all type of combinations src's,streaming with above things, etc(example little snippets, etc in cvrr_vid_recording,cvrr_vidrooms,cvrr_screen_share,(.this-->cvrr_quickshare(with(show in resp(video/audio/etc tag src))/without(downloading after receiving) resp(video/audio/etc tag src)[with webcam,screen_share etc], etc), etc */
  /*[18-01-21] -->> can be added with user invite, admin/owner/someone invite,live streaming like, open chat without showing audience only admin/onwer, etc to vidchat/(for all media's(audio/video/, etc) everything)-->[19-01-21]*/
  /*[19-01-21] --> can be added/done by webtorrents,websockets(native)(here is with websockets(socket.io),webrtc(p2p(peertopeer))) and(&), etc, can be added/done money transfers(superchat like with (datascience intelligence(ai,ml,dl, etc)/(nlp tagging)/, etc)) and(&), etc*/
  /*[19-01-21] --> can be added/done (nlp tagging)/(datascience intelligence(ai,ml,dl, etc)/, etc) for urls(sentiment, recommendations, etc) in boards(lists,cards, etc)/chats/messages/, etc(channels,users, etc), live streamming vids chats, etc*/
  function sendFile() {
    // const peer = peerRef.current;
    // const stream = file.stream();
    // const reader = stream.getReader();

    //console.log(file.size);
    console.log(Math.abs(file.size / 1000));
    //hybridsendFile();// calling a function inside this function can slow done the performance and file after selecting not showing immediately if code is called from hybrid module, writting code in here can fast and shows up file quickly

    // simple original one(less than 50kb)
    // reader.read().then((obj) => {
    //   handlereading(obj.done, obj.value);
    // });

    /* w/o chuncking sending files(less than 50kb) & Sending more than 50kb files(but not possibile for very large files)  */
    // file.arrayBuffer().then((buffer) => {
    //   // Off goes the file!
    //   peer.send(buffer);
    // });

    /* Sending more than 50kb files spliting in chunks(with chuncking) */
    // We convert the file from Blob to ArrayBuffer
    // file.arrayBuffer().then((buffer) => {
    //   /**
    //    * A chunkSize (in Bytes) is set here
    //    * I have it set to 16KB
    //    */
    //   const chunkSize = 16 * 1024;

    //   // Keep chunking, and sending the chunks to the other peer
    //   while (buffer.byteLength) {
    //     const chunk = buffer.slice(0, chunkSize);
    //     buffer = buffer.slice(chunkSize, buffer.byteLength);

    //     // Off goes the chunk!
    //     peer.send(chunk);
    //   }

    //   //peer.send(JSON.stringify({ init: true, fileName: file.name }));

    //   // End message to signal that all chunks have been sent
    //   //peer.send("done!");
    //   peer.send(JSON.stringify({ done: true, fileName: file.name }));
    // });

    // simple original one(less than 50kb)
    // function handlereading(done, value) {
    //   if (done) {
    //     peer.write(JSON.stringify({ done: true, fileName: file.name }));
    //     return;
    //   }

    //   //peer.write(value);//for less than 50mb
    //   //peer.send(value); //for more than 50mb that too to some extend based on ram

    //   reader.read().then((obj) => {
    //     handlereading(obj.done, obj.value);
    //   });
    // }
    /**********************************************************************************************************************************/
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
        //file = "";//assignment to constant error
        //setFile("");//not working just reload sender,receiver so multiple duplicate prob not comes
        //return;
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

        //peer.send(JSON.stringify({ init: true, fileName: file.name }));

        // End message to signal that all chunks have been sent
        //peer.send("done!");
        peer.send(
          JSON.stringify({
            done: true,
            fileName: file.name,
            withchunking: true,
          })
        );
        //file = "";//assignment to constant error
        //setFile("");//not working just reload sender,receiver so multiple duplicate prob not comes
        //return;
      });
    }
  }

  // function helper(){
  //   function sliceandsend(file, sendfunction) {//send func
  //     var fileSize = file.size;
  //     var name = file.name;
  //     var mime = file.type;
  //     var chunkSize = 64 * 1024; // bytes
  //     var offset = 0;

  //  function readchunk() {//send func
  //     var r = new FileReader();
  //     var blob = file.slice(offset, chunkSize + offset);
  //     r.onload = function(evt) {
  //         if (!evt.target.error) {
  //             offset += chunkSize;
  //             console.log("sending: " + (offset / fileSize) * 100 + "%");
  //             if (offset >= fileSize) {
  //                 con.send(evt.target.result); ///final chunk
  //                 console.log("Done reading file " + name + " " + mime);
  //                 return;
  //             }
  //             else {
  //                 con.send(evt.target.result);
  //             }
  //         } else {
  //             console.log("Read error: " + evt.target.error);
  //             return;
  //         }
  //         readchunk();
  //        };
  //         r.readAsArrayBuffer(blob);
  //     }
  //     readchunk();
  //   }
  // }

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

  let downloadPrompt;
  if (gotFile) {
    downloadPrompt = (
      <div>
        <span>
          You have received a file from a Central. Would you like to download
          the file?
        </span>
        {/* <br /> */}
        {/* <button onClick={download}>Yes</button> */}
        {/* room */}
        {/* <div className="blank"></div> */}
        <div className="">
          <Lottie options={anim22} />
        </div>
        <button onClick={download}>Yes</button>
        {/* <video src={videoSrc}></video>
        <audio src={audioSrc}></audio> */}
      </div>
    );
  }

  return (
    <Container>
      {body}
      {downloadPrompt}
    </Container>
  );
};

export default Room;
