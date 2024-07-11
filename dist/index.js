"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
function processImage(imageUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const imageResponse = yield axios_1.default.get(imageUrl, {
            responseType: "arraybuffer",
        });
        const imageBuffer = Buffer.from(imageResponse.data, "binary");
        yield (0, sharp_1.default)(imageBuffer).toFile(path_1.default.join(__dirname, "output", `${imageUrl}.jpg`));
        // Remove white background from individual images
        const maskImage = yield (0, sharp_1.default)(imageBuffer).negate().threshold(10).toBuffer();
        const processedImage = yield (0, sharp_1.default)(imageBuffer)
            .joinChannel(maskImage)
            .toBuffer();
        return processedImage;
    });
}
const topImageUrl = "https://i.postimg.cc/15xL0NLj/t-shirt.avif";
const bottomImageUrl = "https://i.postimg.cc/65dFMpK5/trouser.avif";
const shoesImageUrl = "https://i.postimg.cc/xjNwbPFm/shoes.avif";
// Function to combine images
function combineImages() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const processedShirtImage = yield processImage(topImageUrl);
            const processedPantsImage = yield processImage(bottomImageUrl);
            const processedShoesImage = yield processImage(shoesImageUrl);
            // Combine the images
            const compositeImage = yield (0, sharp_1.default)({
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
                .unflatten()
                .png()
                .toFile(path_1.default.join(__dirname, "output", "compositeImage.jpg"));
            console.log("Image successfully created:", compositeImage);
        }
        catch (error) {
            console.error("Error combining images:", error);
        }
    });
}
// Run the combine images function
combineImages();
