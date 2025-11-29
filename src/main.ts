import './style.css'

let endFrameController = new AbortController();
let frameId = 0

const startFrame = (e: MouseEvent) => {
    const { clientX, clientY } = e

    const newFrame = document.createElement('d-frame')
    newFrame.setAttribute('id', `frame-${frameId}`)
    newFrame.style.top = `${clientY}px`
    newFrame.style.left = `${clientX}px`

    document.body.append(newFrame)
}

const drawFrame = (e: MouseEvent) => {
    const { clientX, clientY } = e

    const newFrame = document.getElementById(`frame-${frameId}`)

    const y = Number(newFrame?.style.top.replace('px', ''))
    const x = Number(newFrame?.style.left.replace('px', ''))

    if (newFrame) {
        newFrame.style.width = Math.abs(clientX - x) + 'px';
        newFrame.style.height = Math.abs(clientY - y) + 'px';
    }
}

const endFrame = () => {
    frameId++;

    endFrameController.abort()
}


const activateFrame = () => {
    document.body.style.setProperty('--cursor', 'crosshair')
    endFrameController = new AbortController();

    endFrameController.signal.addEventListener('abort', () => {
        activateMove()
    })

    document.body.addEventListener('mousedown', startFrame, { signal: endFrameController.signal })
    document.body.addEventListener('mousemove', drawFrame, { signal: endFrameController.signal })
    document.body.addEventListener('mouseup', endFrame, { signal: endFrameController.signal })
}
document.getElementById('frame')?.addEventListener('click', activateFrame);

const activateMove = () => {
    document.body.style.setProperty('--cursor', 'move')
    let activeFrame: HTMLElement | null;
    let frameLeft = 0;
    let frameTop = 0;

    const frames = Array.from(document.querySelectorAll('d-frame')) as HTMLElement[];

    frames.forEach((frame: HTMLElement) => {
        frame.addEventListener('mousedown', ({ target, clientX, clientY }: MouseEvent) => {
            if (target instanceof Element) {
                activeFrame = document.getElementById(target.id ?? '');

                if (activeFrame) {
                    const y = Number(activeFrame.style.top.replace('px', ''));
                    const x = Number(activeFrame.style.left.replace('px', ''));

                    frameLeft = clientX - x;
                    frameTop = clientY - y;
                }
            }
        })
        frame.addEventListener('mousemove', ({ clientX, clientY }) => {
            if (activeFrame) {
                activeFrame.style.top = `${clientY - frameTop}px`;
                activeFrame.style.left = `${clientX - frameLeft}px`;
            }
        })

        frame.addEventListener('mouseup', () => {
            activeFrame = null;
        })
    })
}

document.getElementById('move')?.addEventListener('click', activateMove);

document.getElementById('rectangle')?.addEventListener('click', () => {
    document.body.style.setProperty('--cursor', 'crosshair')
});
