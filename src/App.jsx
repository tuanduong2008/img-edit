import { useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [isBinary, setIsBinary] = useState(false); // Kiểm tra ảnh có là nhị phân hay không

  // Đọc và hiển thị ảnh
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      const img = new Image();
      reader.onload = (e) => {
        img.src = e.target.result;
        img.onload = () => {
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

  // Chuyển ảnh thành nhị phân
  const convertToBinary = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = imageData;

    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      const binary = gray > 127 ? 255 : 0; // Ngưỡng 127
      data[i] = data[i + 1] = data[i + 2] = binary;
    }

    ctx.putImageData(imageData, 0, 0);
    setIsBinary(true);
  };

  // Áp dụng kỹ thuật erosion
  const handleErosion = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = imageData;

    const newImageData = ctx.createImageData(width, height);
    const newData = newImageData.data;

    const getPixel = (x, y) => {
      const index = (y * width + x) * 4;
      return {
        r: data[index],
        g: data[index + 1],
        b: data[index + 2],
        a: data[index + 3],
      };
    };

    const setPixel = (x, y, color) => {
      const index = (y * width + x) * 4;
      newData[index] = color.r;
      newData[index + 1] = color.g;
      newData[index + 2] = color.b;
      newData[index + 3] = color.a;
    };

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const neighbors = [
          getPixel(x - 1, y - 1),
          getPixel(x, y - 1),
          getPixel(x + 1, y - 1),
          getPixel(x - 1, y),
          getPixel(x + 1, y),
          getPixel(x - 1, y + 1),
          getPixel(x, y + 1),
          getPixel(x + 1, y + 1),
        ];

        const currentPixel = getPixel(x, y);

        // Erosion logic
        const isEroded = neighbors.every((pixel) =>
            isBinary
                ? pixel.r === 0 // Đen với ảnh nhị phân
                : pixel.r <= currentPixel.r // So sánh giá trị xám
        );

        const newPixel = isEroded
            ? currentPixel
            : { r: 255, g: 255, b: 255, a: currentPixel.a }; // Trắng nếu không bị ăn mòn

        setPixel(x, y, newPixel);
      }
    }

    ctx.putImageData(newImageData, 0, 0);
  };

  return (
      <div className="container mt-5">
        <h1 className="text-center mb-4">Erosion Experiment</h1>
        <div className="controls d-flex justify-content-center mb-4">
          <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="form-control me-2"
          />
          <button onClick={convertToBinary} className="btn btn-warning me-2">
            Convert to Binary
          </button>
          <button onClick={handleErosion} className="btn btn-danger me-2">
            Apply Erosion
          </button>
        </div>
        <div className="d-flex justify-content-center">
          <canvas ref={canvasRef} style={{ border: "1px solid black" }}></canvas>
        </div>
      </div>
  );
}

export default App;
