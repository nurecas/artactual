var drawing;
var currentLabelIndex = 0;
var currentLabelColor;
var drawW = 800;
var drawH = 720;
var windowScale = 0.8;
var labels;
var myCanvas;
var newimg, strokeRecord;
var renderNewImg = false;
var bruSize = 20;
var brushIncrement = 7;
var url = 'http://192.168.1.37:8000/query';
var mouseRel = true;
var loadAnim, createAnim;
var first = true;
var allowDraw = true;

function preload() {
    labels = loadTable('assets/labels.csv', 'csv', 'header');
}

function setup() {
    myCanvas = createCanvas(windowWidth * windowScale, windowHeight * windowScale);
    myCanvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
    drawW = windowWidth * windowScale;
    drawH = windowHeight * windowScale;
    loadAnim = loadImage("images/loader.gif");
    createAnim = createImg("images/loader.gif");
    createAnim.size(40, 40);
    createAnim.position((windowWidth - width) / 2, (windowHeight - height) / 2)
    createAnim.hide();
    pixelDensity(0.4);
    currentLabelColor = color('#d60000');
    drawing = createGraphics(drawW, drawH);
    drawing.background(color('#000000'));
    drawing.noStroke();
    strokeRecord = createGraphics(drawW, drawH);
    strokeRecord.background(color('#000000'));
}

function windowResized() {
    resizeCanvas(windowWidth * windowScale, windowHeight * windowScale);
}

function draw() {
    clear();

    if (newimg != null)
        image(newimg, 0, 0, drawW, drawH);
    noFill();
    stroke(100, 100, 100);
    strokeWeight(2);
    if (allowDraw) {
        if (renderNewImg == true) {
            strokeRecord.clear();
        } else
            image(strokeRecord, 0, 0);
        if (mouseX < drawW && mouseX > 0 && mouseY > 0 && mouseY < drawH)
            circle(mouseX, mouseY, bruSize);
        if (mouseRel == true && renderNewImg == false && first == true) {
            createAnim.hide();
        } else if (mouseRel == true && renderNewImg == false && first == false) {
            createAnim.show();
        } else {
            createAnim.hide();
        }
    }
    //    console.log(allowDraw);
}

function mouseDragged() {
    if (first)
        first = false;
    if (mouseX < drawW && mouseX > 0 && mouseY > 0 && mouseY < drawH && pmouseX < drawW && pmouseY < drawH) {
        if (allowDraw) {
            //            drawing.noSmooth();
            drawing.fill(currentLabelColor);
            drawing.stroke(currentLabelColor);
            if (!mouseRel) {
                drawing.line(pmouseX, pmouseY, mouseX, mouseY);
                drawing.strokeWeight(bruSize);
                strokeRecord.fill(color("#35aca8"));
                strokeRecord.stroke(color("#35aca8"));
                strokeRecord.strokeWeight(bruSize);
                strokeRecord.line(pmouseX, pmouseY, mouseX, mouseY);
            } else {
                drawing.strokeWeight(1);
                drawing.circle(mouseX, mouseY, 0.5);
            }
            mouseRel = false;
            renderNewImg = false;
        }
    }
}

function mouseReleased() {
    if (allowDraw == true) {
        sendImage();
        mouseRel = true;
    }
}

function keyPressed() {
    if (keyCode === LEFT_ARROW) {
        if (currentLabelIndex > 0)
            currentLabelIndex--;
        else
            currentLabelIndex = 182;
    } else if (keyCode === RIGHT_ARROW) {
        if (currentLabelIndex < 182)
            currentLabelIndex++;
        else
            currentLabelIndex = 0;
    }
    getCurrentColor(currentLabelIndex);
}

function getCurrentColor(a) {
    var currentColor = labels.getColumn('Color')[a];
    //    print(currentColor);
    currentLabelColor = color(currentColor);
}



function newDrawing(data) {
    renderNewImg = true;
    if (data && data.output) {
        newimg = loadImage(data.output);
    }
}

function saveImage() {
    saveCanvas(myCanvas, 'artActual', 'jpg');
}

function sendImage() {
    if (myCanvas && myCanvas.elt) {
        drawing.loadPixels();
        console.log("asdasdas");
        const inputs = {
            "semantic_map": drawing.canvas.toDataURL('image/png64')
        };

        fetch("https://spade-coco-1368d406.hosted-models.runwayml.cloud/v1/query", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Authorization": "Bearer +H8RtDL3nznR7nyveN6bKQ==",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(inputs)
            })
            .then(response => response.json())
            .then(outputs => {
                const {
                    output
                } = outputs;
                newDrawing(outputs);
                // use the outputs in your project
            });

    }
}
