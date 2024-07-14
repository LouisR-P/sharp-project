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
  const maskImage = await sharp(imageBuffer).threshold(253).negate().toBuffer();

  const processedImage = await sharp(imageBuffer)
    .joinChannel(maskImage)
    .toBuffer();

  return processedImage;
}

const topImageUrl =
  "https://images.stockx.com/images/Travis-Scott-Utopia-B1-Tee-White.jpg";
const bottomImageUrl =
  "https://images.stockx.com/images/Stussy-GORE-TEX-Over-Trouser-Magenta.jpg";
const shoesImageUrl =
  "https://images.stockx.com/360/Nike-Air-Humara-LX-Jacquemus-Pink-W/Images/Nike-Air-Humara-LX-Jacquemus-Pink-W/Lv2/img01.jpg";

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
