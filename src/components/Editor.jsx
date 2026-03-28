import Editor from "@monaco-editor/react";

export default function EditorComponent({ language, theme, value, onChange }) {
  return (
    <Editor
      height="100%"
      defaultLanguage={language}
      language={language}
      theme={theme}
      value={value}
      onChange={(v) => onChange(v)}
      options={{
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: "on",
        roundedSelection: false,
        scrollBeyondLastLine: false,
        readOnly: false,
        cursorStyle: "line",
        wordWrap: "on",
      }}
    />
  );
}
