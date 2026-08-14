export default function DeviceFrame({ children }) {
  return (
    <div className="demo-stage">
      <div className="iphone">
        <span className="iphone-btn iphone-silent" aria-hidden />
        <span className="iphone-btn iphone-vol-up" aria-hidden />
        <span className="iphone-btn iphone-vol-down" aria-hidden />
        <span className="iphone-btn iphone-power" aria-hidden />
        <div className="iphone-screen">
          <div className="iphone-island" aria-hidden />
          {children}
          <div className="iphone-home" aria-hidden />
        </div>
      </div>
    </div>
  );
}
