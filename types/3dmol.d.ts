// Global 3Dmol types for better browser compatibility
declare global {
  interface Window {
    $3Dmol: any;
  }
}

declare namespace $3Dmol {
  interface GLViewerOptions {
    backgroundColor?: string;
    antialias?: boolean;
    cameraNear?: number;
    cameraFar?: number;
    height?: number;
    width?: number;
  }

  interface Style {
    stick?: { radius?: number; color?: string };
    sphere?: { radius?: number; color?: string };
    line?: { linewidth?: number; color?: string };
    cartoon?: { color?: string };
  }

  interface SurfaceOptions {
    opacity?: number;
    color?: string;
  }

  enum SurfaceType {
    VDW = 1,
    SAS = 2,
    MS = 3,
    SES = 4
  }

  interface GLViewer {
    addModel(data: string, format: string): void;
    setStyle(sel: object, style: Style): void;
    addSurface(type: SurfaceType, options?: SurfaceOptions, sel?: object): void;
    zoomTo(sel?: object): void;
    render(): void;
    clear(): void;
    resize(): void;
  }

  function createViewer(element: HTMLElement, options?: GLViewerOptions): GLViewer;
}

export {}; 