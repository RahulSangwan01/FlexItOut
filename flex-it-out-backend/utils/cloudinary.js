const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

// Validate Cloudinary credentials
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error("Cloudinary credentials are missing.");
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function for retry delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const uploadOnCloudinary = async (localFilePath, retries = 3) => {
    try {
        if (!localFilePath) {
            console.error("No file path provided.");
            return null;
        }

        // Check if file exists
        if (!fs.existsSync(localFilePath)) {
            console.error(`File does not exist at path: ${localFilePath}`);
            return null;
        }

        // Upload file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            timeout: 120000, 
        });

        if (response && response.secure_url) {
            await fs.promises.unlink(localFilePath);
            console.log(`Successfully uploaded to Cloudinary. Secure URL: ${response.secure_url}`);
            return {
                url: response.secure_url,
                public_id: response.public_id,
                ...response 
            };
        } else {
            console.error("Failed to upload the file. No secure URL returned.");
            throw new Error("No secure URL returned.");
        }
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error.message || error);

        if (retries > 0) {
            console.log(`Retrying upload... Attempts left: ${retries}`);
            await sleep(3000);
            return await uploadOnCloudinary(localFilePath, retries - 1);
        } else {
            try {
                await fs.promises.unlink(localFilePath);
                console.log(`Deleted local file after retries failed: ${localFilePath}`);
            } catch (err) {
                console.error("Error deleting local file:", err);
            }
        }

        return null;
    }
};

// Export function
module.exports = { uploadOnCloudinary };
