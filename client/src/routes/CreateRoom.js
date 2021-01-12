import React from "react";
import { v1 as uuid } from "uuid";

import Lottie from "react-lottie";
import anim0 from "../assets/lotties/webs/43173-web-development.json";
import anim1 from "../assets/lotties/webs/43268-two-businessmen.json";
import anim2 from "../assets/lotties/webs/43292-laptop.json";
import anim3 from "../assets/lotties/webs/43870-web-development.json";
import anim4 from "../assets/lotties/webs/bubble.json";
import anim5 from "../assets/lotties/webs/chat.json";

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

const anim44 = {
  loop: true,
  autoplay: true,
  animationData: anim4,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const anim55 = {
  loop: true,
  autoplay: true,
  animationData: anim5,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const CreateRoom = (props) => {
  function create() {
    const id = uuid();
    props.history.push(`/room/${id}`);
  }

  return (
    <div>
      <br />
      <button
        onClick={create}
        /*style={{ position: "absolute", left: "50%", top: "50px" }}*/
      >
        Create Central
        {/* Create room */}
      </button>
      <div className="blank"></div>
      <div className="w-full md:w-1/2 md:p-12">
        {/* w-full md:w-1/2 md:p-12 */}
        <Lottie options={anim11} />
      </div>
    </div>
  );
};

export default CreateRoom;
