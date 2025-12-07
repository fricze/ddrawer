import "./style.css";

let stopDrawingFrame = new AbortController();
let stopMoving = new AbortController();

let frameId = 0;

const startFrame = (e: MouseEvent) => {
  const { clientX, clientY } = e;

  const newFrame = document.createElement("d-frame");
  newFrame.setAttribute("id", `frame-${frameId}`);
  newFrame.style.top = `${clientY}px`;
  newFrame.style.left = `${clientX}px`;

  document.body.append(newFrame);
};

const drawFrame = (e: MouseEvent) => {
  const { clientX, clientY } = e;

  const newFrame = document.getElementById(`frame-${frameId}`);

  const y = Number(newFrame?.style.top.replace("px", ""));
  const x = Number(newFrame?.style.left.replace("px", ""));

  if (newFrame) {
    newFrame.style.width = Math.abs(clientX - x) + "px";
    newFrame.style.height = Math.abs(clientY - y) + "px";
  }
};

const endFrame = () => {
  frameId++;

  stopDrawingFrame.abort();
};

const activateFrame = () => {
  stopMoving.abort();
  document.body.style.setProperty("--cursor", "crosshair");
  stopDrawingFrame = new AbortController();

  stopDrawingFrame.signal.addEventListener("abort", () => {
    activateMove();
  });

  document.body.addEventListener("mousedown", startFrame, {
    signal: stopDrawingFrame.signal,
  });
  document.body.addEventListener("mousemove", drawFrame, {
    signal: stopDrawingFrame.signal,
  });
  document.body.addEventListener("mouseup", endFrame, {
    signal: stopDrawingFrame.signal,
  });
};
document.getElementById("frame")?.addEventListener("click", activateFrame);

const activateMove = () => {
  if (!stopMoving.signal.aborted) {
    return;
  }

  stopMoving = new AbortController();

  document.body.style.setProperty("--cursor", "move");
  let activeFrame: HTMLElement | null;
  let frameLeft = 0;
  let frameTop = 0;

  const frames = Array.from(
    document.querySelectorAll("d-frame"),
  ) as HTMLElement[];

  frames.forEach((frame: HTMLElement) => {
    frame.addEventListener(
      "mousedown",
      ({ target, clientX, clientY }: MouseEvent) => {
        if (target instanceof Element) {
          activeFrame = document.getElementById(target.id ?? "");

          if (activeFrame) {
            const y = Number(activeFrame.style.top.replace("px", ""));
            const x = Number(activeFrame.style.left.replace("px", ""));

            frameLeft = clientX - x;
            frameTop = clientY - y;
          }
        }
      },
      { signal: stopMoving.signal },
    );

    frame.addEventListener(
      "contextmenu",
      (e) => {
        e.preventDefault();
        frame.remove();
      },
      {
        signal: stopMoving.signal,
      },
    );
  });

  // figma listens on mouse position even when mouse is outside browser window
  // replicate?????
  document.body.addEventListener(
    "mousemove",
    ({ clientX, clientY }) => {
      if (activeFrame) {
        activeFrame.style.top = `${clientY - frameTop}px`;
        activeFrame.style.left = `${clientX - frameLeft}px`;
      }
    },
    { signal: stopMoving.signal },
  );

  document.body.addEventListener(
    "mouseup",
    () => {
      activeFrame = null;
    },
    { signal: stopMoving.signal },
  );
};

const moveButton = document.getElementById("move");
moveButton?.addEventListener("click", activateMove);

const activateRectangle = () => {
  document.body.style.setProperty("--cursor", "crosshair");
  stopMoving.abort();
};
const rectangleButton = document.getElementById("rectangle");
rectangleButton?.addEventListener("click", activateRectangle);
