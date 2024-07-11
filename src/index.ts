import sharp from "sharp";
import path from "path";
import axios from "axios";

async function processImage(imageUrl: string) {
  const imageResponse = await axios.get(imageUrl, {
    responseType: "arraybuffer",
  });
  const imageBuffer = Buffer.from(imageResponse.data, "binary");

  // Save the image to the output folder to check if it's downloaded correctly
  await sharp(imageBuffer).toFile(
    path.join(__dirname, "output", `${imageUrl.split("/").pop()}.jpg`)
  );

  // Remove white background from individual images
  const maskImage = await sharp(imageBuffer).negate().threshold(10).toBuffer();

  const processedImage = await sharp(imageBuffer)
    .joinChannel(maskImage)
    .toBuffer();

  return processedImage;
}

const topImageUrl = "https://i.postimg.cc/15xL0NLj/t-shirt.avif";
const bottomImageUrl = "https://i.postimg.cc/65dFMpK5/trouser.avif";
const shoesImageUrl = "https://i.postimg.cc/xjNwbPFm/shoes.avif";

// Function to combine images
async function combineImages() {
  try {
    const processedShirtImage = await processImage(topImageUrl);
    const processedPantsImage = await processImage(bottomImageUrl);
    const processedShoesImage = await processImage(shoesImageUrl);

    // Combine the images
    const compositeImage = await sharp({
      create: {
        width: 2000, // Set width and height as per your requirement
        height: 2000,
        channels: 4, // RGBA
        background: { r: 255, g: 255, b: 255, alpha: 0 }, // Transparent background
      },
    })
      .composite([
        { input: processedShirtImage, top: 0, left: 0 },
        { input: processedPantsImage, top: 0, left: 500 },
        { input: processedShoesImage, top: 500, left: 0 },
      ])
      //   .unflatten()
      .png()
      .toFile(path.join(__dirname, "output", "compositeImage.jpg"));

    console.log("Image successfully created:", compositeImage);
  } catch (error) {
    console.error("Error combining images:", error);
  }
}

// Run the combine images function
combineImages();
