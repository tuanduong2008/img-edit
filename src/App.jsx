import { useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const canvasRef = useRef(null);
  const originalImageDataRef = useRef(null);
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
          originalImageDataRef.current = ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          ); // Store original data
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // Hàm phóng to ảnh
  const handleZoomIn = () => {
    if (image) {
      setScaleFactor((prevScale) => {
        const newScale = prevScale * 1.2;
        resizeImage(newScale);
        return newScale;
      });
    }
  };

  // Hàm thu nhỏ ảnh
  const handleZoomOut = () => {
    if (image) {
      setScaleFactor((prevScale) => {
        const newScale = prevScale * 0.8;
        resizeImage(newScale);
        return newScale;
      });
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
    if (!canvas) {
      alert("No image to save!");
      return;
    }
    const link = document.createElement("a");
    const imageName = prompt("Enter the name for the image:", "edited-image");
    if (imageName) {
      link.href = canvas.toDataURL("image/png");
      link.download = `${imageName}.png`;
      link.click();
    }
  };

  // Hàm áp dụng hiệu ứng cân bằng histogram
  const handleHistogramEqualization = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Tạo mảng histogram
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < data.length; i += 4) {
      const brightness = Math.round(
        0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      );
      histogram[brightness]++;
    }

    // Tạo mảng phân phối tích lũy (CDF)
    const cdf = new Array(256).fill(0);
    cdf[0] = histogram[0];
    for (let i = 1; i < 256; i++) {
      cdf[i] = cdf[i - 1] + histogram[i];
    }

    // Chuẩn hóa CDF
    const cdfMin = cdf.find((value) => value > 0);
    const cdfMax = cdf[255];
    const cdfNormalized = cdf.map((value) =>
      Math.round(((value - cdfMin) / (cdfMax - cdfMin)) * 255)
    );
    console.log(cdfNormalized);

    // Áp dụng CDF đã chuẩn hóa vào ảnh
    for (let i = 0; i < data.length; i += 4) {
      const brightness = Math.round(
        0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      );
      const equalizedValue = cdfNormalized[brightness];
      data[i] = equalizedValue;
      data[i + 1] = equalizedValue;
      data[i + 2] = equalizedValue;
    }

    ctx.putImageData(imageData, 0, 0);
  };

  // Hàm hủy hiệu ứng cân bằng histogram
  const handleCancelHistogramEqualization = () => {
    if (originalImageDataRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.putImageData(originalImageDataRef.current, 0, 0); // Restore original data
    } else {
      alert("No original image data to restore!");
    }
  };

  return (
    <div className='container mt-5'>
      <h1 className='text-center mb-4'>Image Editor</h1>
      <div className='controls d-flex justify-content-center mb-4'>
        <input
          type='file'
          accept='image/*'
          onChange={handleFileUpload}
          className='form-control me-2'
        />
        <button onClick={handleZoomIn} className='btn btn-primary me-2'>
          Zoom In
        </button>
        <button onClick={handleZoomOut} className='btn btn-primary me-2'>
          Zoom Out
        </button>
        <button
          onClick={handleHistogramEqualization}
          className='btn btn-secondary me-2'
        >
          Apply Histogram Equalization
        </button>
        <button
          onClick={handleCancelHistogramEqualization}
          className='btn btn-warning me-2'
        >
          Cancel Histogram Equalization
        </button>
        <button onClick={handleSaveImage} className='btn btn-success'>
          Save Image
        </button>
      </div>
      <div className='d-flex justify-content-center'>
        <canvas ref={canvasRef} style={{ border: "1px solid black" }}></canvas>
      </div>
    </div>
  );
}

export default App;
