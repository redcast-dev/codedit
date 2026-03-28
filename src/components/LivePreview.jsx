import { useEffect, useRef } from "react";

export default function LivePreview({ files }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    // Build HTML from files
    const html = files["index.html"]?.content || "";
    const base = `<!doctype html>\n<html>\n<head><meta charset="utf-8"></head>\n<body>\n`;
    
    // Inject other js files into HTML (basic approach)
    let scripts = "";
    Object.values(files).forEach((f) => {
      if (f.language === "javascript" && f.name !== "bundle.js") {
        scripts += `<script>\n${f.content}\n</script>\n`;
      }
    });
    
    const out = base + html.replace(/<script src=".*"><\/script>/, "") + scripts + "\n</body>\n</html>";

    const iframe = iframeRef.current;
    if (iframe) {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(out);
      doc.close();
    }
  }, [files]);

  return (
    <div className="h-full border-l border-gray-200">
      <iframe
        ref={iframeRef}
        title="live-preview"
        className="w-full h-full"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
