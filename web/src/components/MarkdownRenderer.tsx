'use client';

import React from 'react';
import styles from './MarkdownRenderer.module.css';

interface MarkdownRendererProps {
  content: string;
}

// Simple markdown to HTML converter
function parseMarkdown(markdown: string): React.ReactNode[] {
  const lines = markdown.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let inCodeBlock = false;
  let codeContent = '';
  let codeLanguage = '';

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className={styles.list}>
          {currentList.map((item, idx) => (
            <li key={idx} className={styles.listItem}>{item}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const flushCodeBlock = () => {
    if (codeContent) {
      elements.push(
        <pre key={`code-${elements.length}`} className={styles.codeBlock}>
          <code className={styles.code}>{codeContent}</code>
        </pre>
      );
      codeContent = '';
      codeLanguage = '';
    }
  };

  lines.forEach((line, idx) => {
    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
        codeLanguage = line.slice(3);
      }
      return;
    }

    if (inCodeBlock) {
      codeContent += line + '\n';
      return;
    }

    // Headings
    if (line.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={idx} className={styles.h1}>{line.slice(2)}</h1>
      );
      return;
    }

    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={idx} className={styles.h2}>{line.slice(3)}</h2>
      );
      return;
    }

    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={idx} className={styles.h3}>{line.slice(4)}</h3>
      );
      return;
    }

    // Lists
    if (line.startsWith('- ') || line.startsWith('* ')) {
      currentList.push(line.slice(2));
      return;
    }

    // Horizontal rule
    if (line.match(/^[-*_]{3,}$/)) {
      flushList();
      elements.push(<hr key={idx} className={styles.hr} />);
      return;
    }

    // Empty line
    if (line.trim() === '') {
      flushList();
      if (elements.length > 0 && !React.isValidElement(elements[elements.length - 1])) {
        return;
      }
      elements.push(<div key={idx} className={styles.spacer} />);
      return;
    }

    // Paragraphs
    flushList();
    const processedLine = line
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/`(.*?)`/g, '<code>$1</code>');

    elements.push(
      <p
        key={idx}
        className={styles.paragraph}
        dangerouslySetInnerHTML={{ __html: processedLine }}
      />
    );
  });

  flushList();
  flushCodeBlock();

  return elements;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const elements = parseMarkdown(content);

  return (
    <div className={styles.container}>
      {elements}
    </div>
  );
}
