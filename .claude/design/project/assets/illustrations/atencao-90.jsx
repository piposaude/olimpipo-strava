import Vector from "./Vector/Vector.jsx";
import Rectangle2560 from "./Rectangle2560/Rectangle2560.jsx";

// figma node: 14242:7280 (SYMBOL) "90/Atenção"
export default function AtenO90() {
  return (
    <div data-name="90/Atenção" style={{ position: "relative", width: 90, height: 90 }}>
      <div style={{
        position: "absolute",
        left: 16,
        top: 10,
        width: 58.664,
        height: 70.331,
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 19.785,
          width: 58.664,
          height: 50.547,
          overflow: "hidden",
        }}>
          <svg width={52.582} height={33.970} viewBox="0 0 52.582 33.970" fill="rgb(222,120,92)" style={{
            position: "absolute",
            left: 3.219,
            top: 3.36,
            width: 52.582,
            height: 33.97,
            backgroundColor: "rgb(222,120,92)",
          }}>
            <path d="M 6.796 0 L 45.071 0 L 52.582 33.97 L 0 33.97 L 6.796 0 Z" fillRule="nonzero" />
          </svg>
          <div style={{
            position: "absolute",
            left: 22.893,
            top: 13.812,
            width: 12.52,
            height: 27.997,
            backgroundColor: "rgb(231,177,148)",
          }} />
          <svg width={19.674} height={32.850} viewBox="0 0 19.674 32.850" fill="rgb(0,0,0)" style={{
            position: "absolute",
            left: 19.315,
            top: 11.199,
            width: 19.674,
            height: 32.85,
            backgroundColor: "rgb(0,0,0)",
          }}>
            <path d="M 7.955 0 L 11.719 0 C 13.949 0 19.674 5.665 19.674 8.002 L 19.674 32.843 L 15.821 32.843 L 15.821 3.288 L 3.852 3.288 L 3.852 32.85 L 0 32.85 L 0 8.002 C 0 5.665 5.725 0 7.955 0 Z" fillRule="nonzero" />
          </svg>
          <div style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: "matrix(0,1,-1,0,55.802,39.196)",
            transformOrigin: "0 0",
            width: 7.839,
            height: 52.582,
            backgroundColor: "rgb(255,255,255)",
          }} />
          <div style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 58.664,
            height: 50.547,
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 58.664,
              height: 50.547,
              overflow: "hidden",
            }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Vector key={i} />
              ))} {/* 3× → /Illustrations/components/AtenO90/Vector/Vector.jsx */}
              <div style={{
                position: "absolute",
                left: 0,
                top: 0,
                transform: "matrix(0,1,-1,0,58.664,36.956)",
                transformOrigin: "0 0",
                width: 3.733,
                height: 58.663,
                backgroundColor: "rgb(0,0,0)",
              }} />
              <svg width={44.625} height={3.512} viewBox="0 0 44.625 3.512" fill="rgb(0,0,0)" style={{
                position: "absolute",
                left: 0,
                top: 0,
                transform: "matrix(1,0,0,-1,6.953,3.512)",
                transformOrigin: "0 0",
                width: 44.625,
                height: 3.512,
                backgroundColor: "rgb(0,0,0)",
              }}>
                <path d="M 44.625 0 L 44.4 1.478 L 40.843 1.478 C 39.248 1.478 39.071 3.512 37.123 3.512 L 7.214 3.512 C 5.266 3.512 5.089 1.478 3.494 1.478 L 0.448 1.406 L 0 0 L 44.625 0 Z" fillRule="nonzero" />
              </svg>
            </div>
            <div style={{
              position: "absolute",
              left: 0,
              top: 37.329,
              width: 3.935,
              height: 11.199,
              backgroundColor: "rgb(0,0,0)",
            }} />
            <div style={{
              position: "absolute",
              left: 54.729,
              top: 37.329,
              width: 3.935,
              height: 11.199,
              backgroundColor: "rgb(0,0,0)",
            }} />
          </div>
        </div>
        <div style={{
          position: "absolute",
          left: 11.446,
          top: 0,
          width: 35.788,
          height: 14.738,
          overflow: "hidden",
        }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Rectangle2560 key={i} />
          ))} {/* 3× → /Illustrations/components/AtenO90/Rectangle2560/Rectangle2560.jsx */}
        </div>
      </div>
    </div>
  );
}
