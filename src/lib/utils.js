import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

/**
 * Get language icon/color
 */
export function getLanguageInfo(language) {
    const languageMap = {
        javascript: { icon: "JS", color: "#f7df1e", label: "JavaScript" },
        typescript: { icon: "TS", color: "#3178c6", label: "TypeScript" },
        html: { icon: "HTML", color: "#e34c26", label: "HTML" },
        css: { icon: "CSS", color: "#563d7c", label: "CSS" },
        json: { icon: "JSON", color: "#000000", label: "JSON" },
        markdown: { icon: "MD", color: "#083fa1", label: "Markdown" },
        python: { icon: "PY", color: "#3776ab", label: "Python" },
        jsx: { icon: "JSX", color: "#61dafb", label: "React" },
        tsx: { icon: "TSX", color: "#61dafb", label: "React TS" },
    };
    return languageMap[language] || { icon: "FILE", color: "#6b7280", label: language };
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Get file extension
 */
export function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

/**
 * Get language from filename
 */
export function getLanguageFromFilename(filename) {
    const ext = getFileExtension(filename);
    const extMap = {
        js: "javascript",
        jsx: "javascript",
        ts: "typescript",
        tsx: "typescript",
        html: "html",
        css: "css",
        json: "json",
        md: "markdown",
        py: "python",
    };
    return extMap[ext] || "plaintext";
}
