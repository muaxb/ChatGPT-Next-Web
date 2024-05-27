import heic2any from "heic2any";

export function compressImage(file: File, maxSize: number): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (readerEvent: ProgressEvent<FileReader>) => {
            const image = new Image();
            image.onload = () => {
                let canvas = document.createElement("canvas");
                let ctx = canvas.getContext("2d");
                let width = image.width;
                let height = image.height;
                let quality = 0.9;
                let dataUrl: string;

                const processImage = () => {
                    try {
                        canvas.width = width;
                        canvas.height = height;
                        ctx?.clearRect(0, 0, canvas.width, canvas.height);
                        ctx?.drawImage(image, 0, 0, width, height);
                        dataUrl = canvas.toDataURL("image/jpeg", quality);

                        if (dataUrl.length * 0.75 < maxSize || quality <= 0.5) {
                            resolve(dataUrl);
                        } else {
                            if (quality > 0.5) {
                                quality -= 0.1;
                            } else {
                                width *= 0.9;
                                height *= 0.9;
                            }
                            processImage();
                        }
                    } catch (error) {
                        console.error("Error during image compression:", error);
                        reject(error);
                    }
                };

                processImage();
            };

            image.onerror = (error) => {
                console.error("Error loading image:", error);
                reject(error);
            };

            image.src = readerEvent.target?.result as string;
        };

        reader.onerror = (error) => {
            console.error("Error reading file:", error);
            reject(error);
        };

        const isHeic = file.type === "image/heic" || file.type === "image/heif" || file.name.endsWith(".heic") || file.name.endsWith(".heif");
        if (isHeic) {
            heic2any({ blob: file, toType: "image/jpeg" })
                .then((blob) => {
                    reader.readAsDataURL(blob as Blob);
                })
                .catch((e) => {
                    console.error("Error converting HEIC to JPEG:", e);
                    reject(e);
                });
        } else {
            reader.readAsDataURL(file);
        }
    });
}
