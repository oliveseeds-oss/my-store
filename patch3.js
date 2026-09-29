const fs = require('fs');

function patchProductList() {
  let code = fs.readFileSync('public-website/src/pages/ProductList.jsx', 'utf8');
  
  code = code.replace(
    'import { getProductMainImage } from "../utils/imageHelper";',
    'import { getProductMainImage, getAllProductImages } from "../utils/imageHelper";\nimport HoverSlideshow from "../components/HoverSlideshow";'
  );
  
  code = code.replace(
    'const img = getProductMainImage(p);',
    'const img = getProductMainImage(p);\n  const allImages = getAllProductImages(p);'
  );
  
  const oldImg = \          {img ? (
            <img
              src={img}
              alt={p.name}
              className="product-card-image"
              loading="lazy"
              decoding="async"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.35s ease-out",
                transform: hovered ? "scale(1.02)" : "scale(1)",
                display: "block"
              }}
            />
          ) : (\;
  
  const newImg = \          {allImages.length > 1 ? (
            <HoverSlideshow 
              imageUrls={allImages}
              alt={p.name}
              className="product-card-image"
              style={{ width: "100%", height: "100%", transform: hovered ? "scale(1.02)" : "scale(1)", transition: "transform 0.35s ease-out" }}
            />
          ) : img ? (
            <img
              src={img}
              alt={p.name}
              className="product-card-image"
              loading="lazy"
              decoding="async"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.35s ease-out",
                transform: hovered ? "scale(1.02)" : "scale(1)",
                display: "block"
              }}
            />
          ) : (\;
          
  code = code.replace(oldImg, newImg);
  fs.writeFileSync('public-website/src/pages/ProductList.jsx', code);
}
patchProductList();
