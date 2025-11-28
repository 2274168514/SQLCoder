import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as Recharts from 'recharts';
import ReactDom from 'react-dom/client';

interface JsVisualizerProps {
  code: string;
}

export const JsVisualizer: React.FC<JsVisualizerProps> = ({ code }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous content
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    setError(null);

    // Check if code is empty
    if (!code || code.trim() === '') {
      setError('请输入D3.js可视化代码');
      return;
    }

    try {
      // Use a safer approach to evaluate user code
      // Wrap user code in a function and provide necessary variables
      const userCode = `
        (function() {
          const container = arguments[0];
          const d3 = arguments[1];
          const Recharts = arguments[2];
          const React = arguments[3];
          const ReactDom = arguments[4];

          try {
            ${code}
            return { success: true };
          } catch (e) {
            return { success: false, error: e.message };
          }
        })
      `;

      // Create the function
      const renderFunc = eval(userCode);

      // Execute with proper error handling
      const result = renderFunc(
        containerRef.current,
        d3,
        Recharts,
        React,
        ReactDom
      );

      if (result && !result.success) {
        throw new Error(result.error);
      }

    } catch (err: any) {
      console.error("Visualization Error:", err);
      setError(err.message || 'Error executing visualization script');
    }
  }, [code]);

  return (
    <div className="w-full h-full">
      {error ? (
        <div className="text-red-500 bg-red-50 p-4 rounded border border-red-100">
          <strong>Runtime Error:</strong> {error}
        </div>
      ) : (
        <div ref={containerRef} className="w-full h-full" />
      )}
    </div>
  );
};
