import { useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [scaleFactor, setScaleFactor] = useState(1);

  // Hàm đọc và hiển thị ảnh
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      const img = new Image();
      reader.onload = function (e) {
        img.src = e.target.result;
        img.onload = function () {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          setImage(img);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // Hàm phóng to ảnh
  const handleZoomIn = () => {
    if (image) {
      setScaleFactor((prevScale) => prevScale * 1.2);
      resizeImage(1.2);
    }
  };

  // Hàm thu nhỏ ảnh
  const handleZoomOut = () => {
    if (image) {
      setScaleFactor((prevScale) => prevScale * 0.8);
      resizeImage(0.8);
    }
  };

  // Hàm vẽ lại ảnh với kích thước mới
  const resizeImage = (scale) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const newWidth = image.width * scaleFactor * scale;
    const newHeight = image.height * scaleFactor * scale;
    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.drawImage(image, 0, 0, newWidth, newHeight);
  };

  // Hàm lưu ảnh
  const handleSaveImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    const imageName = prompt("Enter the name for the image:", "edited-image");
    if (imageName) {
      link.href = canvas.toDataURL("image/png");
      link.download = `${imageName}.png`;
      link.click();
    }
  };

  // Hàm áp dụng hiệu ứng grayscale
  const handleGrayscale = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg; // Red
      data[i + 1] = avg; // Green
      data[i + 2] = avg; // Blue
    }

    ctx.putImageData(imageData, 0, 0);
  };

  return (
    <div className="container mt-05">
      <h1 className="text-center mb-04">Image Editor</h1>
      <div className="controls d-flex justify-content-center mb-04">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="form-control me-2"
        />
        <button onClick={handleZoomIn} className="btn btn-primary me-2">
          Zoom In
        </button>
        <button onClick={handleZoomOut} className="btn btn-primary me-2">
          Zoom Out
        </button>
        <button onClick={handleGrayscale} className="btn btn-secondary me-2">
          Grayscale
        </button>
        <button onClick={handleSaveImage} className="btn btn-success">
          Save Image
        </button>
      </div>
      <div className="d-flex justify-content-center">
        <canvas ref={canvasRef} style={{ border: "1px solid black" }}></canvas>
      </div>
    </div>
  );
}

export default App;
