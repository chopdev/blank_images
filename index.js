let getPixels = require("get-pixels");
var fs = require('fs');
const path = require('path');
const moveFile = require('move-file');

;; (async () => {

  const sourcePath = process.env.SOURCE == null ? "./../ADS_1" : process.env.SOURCE;
  const destinationPath =  process.env.SOURCE == null ? "./../ADS_DEST" : process.env.SOURCE; 

  const files = fs.readdirSync(sourcePath);
  let failedScreens = [];

  for (const file of files) {
    try {
      var start = new Date();
      const maxCoef = await getColorsCoef(path.join(sourcePath, file));
      var elapsed = new Date() - start;
      console.log("TIME: " + elapsed / 1000 + " sec");
      console.log('');

      if(maxCoef >= 0.8) {
        failedScreens.push(file);
        await moveFile(path.join(sourcePath, file), path.join(destinationPath, file));
      }
        
    }
    catch(ex) {
      console.log(ex);
    }
  }

  console.log(failedScreens);

})();


function getColorsCoef(filePath) {
  return new Promise((resolve, reject) => {

    getPixels(filePath, function(err, pixels) {
      
      if(err) {
        reject(err);
        return;
      }
  
      const colorToCount = new Map();
      let allCount = 0;
      const pixelBytes = pixels.data;
      for (let i = 0; i < pixelBytes.length; i+= 4) {
        const color = "#" + pixelBytes[i] + pixelBytes[i+1] + pixelBytes[i+2] + pixelBytes[i+3];
        if(colorToCount.has(color))
          colorToCount.set(color, colorToCount.get(color) + 1);
        else
          colorToCount.set(color, 1);
  
        allCount++;
      }
  
      let maxRatio = 0;
      for (const pair of colorToCount.entries()) {
        let ratio = pair[1] / allCount;
        maxRatio = maxRatio > ratio ? maxRatio : ratio;
        //colorToCount.set(pair[0], ratio);
      }
      console.log("MAX:" + maxRatio + "   " + filePath);
  
      resolve(maxRatio);
    });
  });
}
