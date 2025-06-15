const fs = require("fs");
const path = require("path");
const PNG = require("pngjs").PNG;
const process = require("process");

function GetFileasHex(filedir) {
  const data = fs.readFileSync(filedir, { encoding: null, flag: "r+" });
  if (data) {
    return data.toString("hex");
  } else return;
}

function FileMetaData(filedir) {
  const filehex = GetFileasHex(filedir);
  const filename = path.basename(filedir);
  let hexedmetadata = Buffer.from(`${filename};${filehex.length},`);
  return `${hexedmetadata.toString("hex")}${filehex}`;
}

// function hextocolor(filehex) {
//   let resultarr = [];
//   for (let i = 0; i < filehex.length; i += 6) {
//     resultarr.push("#" + filehex.substr(i, 6).padEnd(6, "0"));
//   }
//   return resultarr;
// }

function GetBestDimension(noofpixels, aspectratio = { x: 1, y: 1 }) {
  const k = Math.ceil(Math.sqrt(noofpixels / (aspectratio.x * aspectratio.y)));
  return { x: k * aspectratio.x, y: k * aspectratio.y };
}

// function CreateImgfromPixelColors(pixelColorArray, outputfile) {
//   const dimension = GetBestDimension(pixelColorArray.length);
//   const canv = canvas.createCanvas(dimension.x, dimension.y);
//   const context = canv.getContext("2d");
//   context.imageSmoothingEnabled = false;
//   context.mozImageSmoothingEnabled = false;
//   context.webkitImageSmoothingEnabled = false;
//   context.antialias = "none";
//   let x = 0;
//   let y = 0;
//   for (const color of pixelColorArray) {
//     if (x > dimension.x) {
//       y++;
//       x = 0;
//     }
//     context.fillStyle = color;
//     context.fillRect(x, y, 1, 1);
//     x++;
//   }
//   const pngwritestream = fs.createWriteStream(outputfile);
//   canv.createPNGStream().pipe(pngwritestream);
//   pngwritestream.on("finish", () => {
//     console.log(
//       `PNG File exported as ${outputfile} with Dimension ${dimension.x}, ${dimension.y}`
//     );
//   });
// }

// async function ConvertPngtoUnicode(inputfile) {
//   const img = await canvas.loadImage(inputfile);
//   const canv = canvas.createCanvas(img.width, img.height);
//   const context = canv.getContext("2d");
//   context.antialias = "none";
//   context.imageSmoothingEnabled = false;
//   context.drawImage(img, 0, 0);
//   let pixelData = context.getImageData(0, 0, canv.width, canv.height).data;
//   pixelData = pixelData.filter((element, index, array) => {
//     return (index + 1) % 4 != 0;
//   });
//   const startindex = pixelData.indexOf(44);
//   let metadata = "";
//   for (let i = 0; i < startindex; i++)
//     metadata += String.fromCharCode(pixelData[i]);
//   metadata = metadata.split(";");

//   let actualdata = "";
//   for (
//     let i = startindex + 1;
//     i <= parseInt(metadata[0]) + startindex + 1;
//     i++
//   ) {
//     actualdata += String.fromCharCode(pixelData[i]);
//   }
//   return actualdata;
// }

//via pngjs

function CreateImgfromPixelColors(
  hexedfilewithmetadata,
  outputfile,
  aspectratio
) {
  hexpalltete = hexedfilewithmetadata;
  const dimen = GetBestDimension(
    Math.ceil(hexpalltete.length / 6),
    aspectratio
  );
  hexpalltete = hexpalltete.padEnd(dimen.x * dimen.y * 8, "ff");
  const png = new PNG({
    width: dimen.x,
    height: dimen.y,
    bgColor: {
      red: 0,
      green: 0,
      blue: 0,
    },
  });
  png.data = Buffer.from(hexpalltete, "hex");
  png.pack().pipe(fs.createWriteStream(outputfile));
  console.log(
    `PNG File exported as ${outputfile} with Dimension ${dimen.x}, ${dimen.y}`
  );
}

function ConvertPngtoUnicode(inputfile) {
  let actualdata = "";
  let metadata = "";
  let inputfiledata = fs.readFileSync(inputfile);
  let png = PNG.sync.read(inputfiledata);
  let startindex = png.data.indexOf(",");

  for (let i = 0; i < startindex; i++) {
    metadata += String.fromCharCode(png.data.at(i));
  }
  metadata = metadata.split(";");

  if (metadata.length > 0) {
    return {
      filename: metadata[0],
      data: png.data.filter((element, index, array) => {
        if (
          index > startindex &&
          index <= parseInt(metadata[1]) / 2 + startindex
        )
          return true;
      }),
    };
  }
}
// CreateImgfromPixelColors(FileMetaData("./a.pdf"), "./final.png");

// const file = ConvertPngtoUnicode("./finald.png");
// console.log(file);
// fs.writeFileSync("Decoded_" + file.filename, file.data);
//node index.js e -i "index.txt" -o "out.png" -r 16:9
const args = process.argv;

try {
  if (args.length < 4) {
    console.error("Arguments are very less");
  }
  let inputfile = args[args.indexOf("-i") + 1];
  let outfile = args[args.indexOf("-o") + 1];
  if (args[2] == "e" || args[2] == "encode") {
    let aspectratio = args[args.indexOf("-r") + 1].split(":");
    if (inputfile != args[0]) {
      const fd = path.parse(inputfile);
      CreateImgfromPixelColors(
        FileMetaData(inputfile),
        outfile != args[0] ? outfile : fd.dir + "/" + fd.name + ".png",
        aspectratio != null && aspectratio.length == 2
          ? { x: aspectratio[0], y: aspectratio[1] }
          : { x: 1, y: 1 }
      );
    }
  } else if (args[2] == "d" || args[2] == "decode") {
    if (inputfile != args[0]) {
      const file = ConvertPngtoUnicode(inputfile);
      fs.writeFileSync(
        outfile != args[0]
          ? outfile
          : path.dirname(inputfile) + "/Decoded_" + file.filename,
        file.data
      );
      console.log(
        "Decoding Completed SucessFully to " +
          (outfile != args[0]
            ? outfile
            : path.dirname(inputfile) + "/Decoded_" + file.filename)
      );
    }
  } else {
    console.log("Invalid; Nothing to do.");
  }
} catch (e) {
  console.log("Something is wrong:" + e);
}
