//Variables
var template = `#Made by numviewer.web.app
from kandinsky import *
fill_rect(0, 0, 320, 222, {bg_color})
content = "{content}"
lines = [content[i:i + {width}] for i in range(0, len(content), {width})]
for y in range(len(lines)):
  pixels = [lines[y][i:i + 6] for i in range(0, len(lines[y]), 6)]
  for x in range(len(pixels)):
    fill_rect(x*{size}, y*{size}, {size}, {size}, color(int(pixels[x][:2], 16), int(pixels[x][2:4], 16), int(pixels[x][4:], 16)))`

const calc = document.getElementById('calc');
const preview = document.getElementById('preview');
const previewCtx = preview.getContext("2d");

const inputFile = document.getElementById('inputFile');
var inputFileReader = new FileReader();

const img_width = document.getElementById('img_width');
const img_width_txt = document.getElementById('img_width_txt');
const img_height = document.getElementById('img_height');
const img_height_txt = document.getElementById('img_height_txt');
const img_bg = document.getElementById('img_bg');
const img_bg_txt = document.getElementById('img_bg_txt');

var img_size = 0;
var img = new Image();

//Settings
previewCtx.mozImageSmoothingEnabled = false;
previewCtx.webkitImageSmoothingEnabled = false;
previewCtx.imageSmoothingEnabled = false;

//Select file
inputFile.addEventListener("change", function(event) {
  if (inputFile.value) {
    inputFileReader.readAsDataURL(event.target.files[0]);
  }
});
img.onload = refresh_preview
inputFileReader.onload = ()=>{
  img.src = inputFileReader.result;
}
function selectFile() {
  inputFile.click();
}

//Refresh preview
function refresh_preview(){

  previewCtx.clearRect(0, 0, 320, 222);
  previewCtx.fillStyle = img_bg.value;
  previewCtx.fillRect(0, 0, preview.width, preview.height);

  var w = img_width.value,
  h = img_height.value;
  img_size = Math.round(Math.min(preview.width / w, preview.height / h));
  previewCtx.drawImage(img, 0, 0, w, h);
  previewCtx.drawImage(preview, 0, 0, w, h, 0, 0, w * img_size, h * img_size);
}

//Image width
img_width.oninput = ()=>{
  img_width_txt.innerHTML = 'Largeur (' + img_width.value + ')';
  refresh_preview()
}
//Image height
img_height.oninput = ()=>{
  img_height_txt.innerHTML = 'Hauteur (' + img_height.value + ')';
  refresh_preview()
}

//Image background
function changeColor() {
  img_bg.click();
}
img_bg.onchange = function() {
  img_bg_txt.innerHTML = "Fond (" + this.value + ")";
  refresh_preview();
}

//Get code
function getCode() {
  var processImage = document.createElement('canvas');
  var processImageCtx = processImage.getContext('2d');
  processImage.width = img_width.value;
  processImage.height = img_height.value;
  processImageCtx.drawImage(img, 0, 0, processImage.width, processImage.height);
  var content = "";
  for (let y = 0; y < processImage.height; y++) {
    for (let x = 0; x < processImage.width; x++){
      var data = processImageCtx.getImageData(x, y, 1, 1).data;
      let r = data[0].toString(16);
      if (r.length == 1){
        r = '0' + r;
      }
      let g = data[1].toString(16);
      if (g.length == 1){
        g = '0' + g;
      }
      let b = data[2].toString(16);
      if (b.length == 1){
        b = '0' + b;
      }
      content += r + g + b
    }
  }
  var bg_color = "color(" + img_bg.value.match(/[A-Za-z0-9]{2}/g).map(function(v) { return parseInt(v, 16) }).join(",") + ")";
  var toClip = template.replaceAll('{bg_color}', bg_color).replaceAll('{size}', img_size).replaceAll('{width}', Math.round(img_width.value * 6)).replaceAll('{content}', content);
  var copyText = document.createElement("textarea");
  copyText.value = toClip;
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(copyText.value);
  swal("Code copier !", "Il ne vous reste plus qu'a l'importer sur votre calculatrice depuis le site officiel de numworks.", "success");
}