const screenVideo = document.querySelector('video');
const startRec = document.getElementById('startrecording');
const stopRec = document.getElementById('stoprecording');
const sourceSel = document.getElementById('sourceselect');
const { desktopCapturer, remote, dialog } = require('electron');
const { Menu } = remote;
const { filePath } = await dialog.showSaveDialog({
    buttonLabel: 'Save Video Here',
    defaultPath: `video${Date.now()}.webm`
});
const { writeFile } = require('fs');
async function getScreenSources(){
    const screenSources = await desktopCapturer.getSources({
        types: ['window','screen'] // electron certainly makes life easy!
    });
    const sourceOptionsMenu = Menu.buildFromTemplate(
        screenSources.map(source => {
            return {
                label: source.name,
                click: () => sourceSelect(source)
            };
        })
    );
    sourceOptionsMenu.popup();
}
let screenRecorder;
const recordingChunks = [];

async function sourceSelect(source) {
    sourceSel.innerText = source.name;
    const constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaId: source.id
            }
        }
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    // Screen Preview
    screenVideo.srcObject = stream;
    screenVideo.play();
    // Media Recorder
    const options = {mimeType: 'video/webm; codecs=vp9'};
    screenRecorder = new MediaRecorder(stream, options);
    // Handlers
    screenRecorder.ondataavailable = chunkData;
    screenRecorder.onstop = stopSave;
}
// Screen Capture
function chunkData(a) {
    console.log('video stream available');
    recordingChunks.push(a.data);
}
// Saving to file
async function stopSave(a){
    const blob = new Blob(recordingChunks, {
        type: 'video/webm; codecs=vp9'
    });
    const buffer = Buffer.from(await blob.arrayBuffer());
    console.log(filePath);
    writeFile(filePath, buffer, () => console.log(`Recording saved!`));
    
}
