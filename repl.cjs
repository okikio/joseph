// import cloudinary from "cloudinary";
const cloudinary = require("cloudinary");

cloudinary.v2.config({
    cloud_name: "",
    api_key: "",
    api_secret: ""
});
cloudinary.v2.uploader.explicit("joseph-projects/ultima-apparel/MoCapLimitedTest",
    {
        resource_type: "video", type: "upload",
        eager_async: true,
        eager: [
            { format: "mp4", quality: "auto:low", video_codec: "auto", raw_transformations: "f_mp4,vc_auto,q_auto:low" },
        ]
    },
    function (error, result) {
        if (error) return console.warn(error);
        console.log(result);
    }
);