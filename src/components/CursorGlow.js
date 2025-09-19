import React, { useEffect, useRef } from 'react';
import './CursorGlow.css';

const CursorGlow = () => {
  const cursorGlowRef = useRef(null);
  const cursorDotRef = useRef(null);
  const cursorTrailRef = useRef(null);
  const requestRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
    const updatePosition = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      
      // 直接更新DOM，不经过React重新渲染
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
      
      // 检查鼠标是否在可点击元素上
      const target = e.target;
      const isClickable = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.classList.contains('clickable') ||
        target.style.cursor === 'pointer' ||
        window.getComputedStyle(target).cursor === 'pointer';
      
      if (cursorGlowRef.current && cursorDotRef.current) {
        if (isClickable) {
          cursorGlowRef.current.classList.add('pointer');
          cursorDotRef.current.classList.add('pointer');
        } else {
          cursorGlowRef.current.classList.remove('pointer');
          cursorDotRef.current.classList.remove('pointer');
        }
      }
    };
    
    // 平滑跟随动画
    const animateGlow = () => {
      // 缓动跟随
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * 0.15;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * 0.15;
      
      if (cursorGlowRef.current) {
        cursorGlowRef.current.style.transform = 
          `translate(${currentPos.current.x}px, ${currentPos.current.y}px) translate(-50%, -50%)`;
      }
      
      if (cursorTrailRef.current) {
        cursorTrailRef.current.style.transform = 
          `translate(${currentPos.current.x}px, ${currentPos.current.y}px) translate(-50%, -50%)`;
      }
      
      requestRef.current = requestAnimationFrame(animateGlow);
    };

    const handleMouseDown = () => {
      if (cursorGlowRef.current && cursorDotRef.current) {
        cursorGlowRef.current.classList.add('clicking');
        cursorDotRef.current.classList.add('clicking');
      }
    };
    
    const handleMouseUp = () => {
      if (cursorGlowRef.current && cursorDotRef.current) {
        cursorGlowRef.current.classList.remove('clicking');
        cursorDotRef.current.classList.remove('clicking');
      }
    };
    
    const handleMouseLeave = () => {
      if (cursorGlowRef.current && cursorDotRef.current && cursorTrailRef.current) {
        cursorGlowRef.current.style.opacity = '0';
        cursorDotRef.current.style.opacity = '0';
        cursorTrailRef.current.style.opacity = '0';
      }
    };
    
    const handleMouseEnter = () => {
      if (cursorGlowRef.current && cursorDotRef.current && cursorTrailRef.current) {
        cursorGlowRef.current.style.opacity = '1';
        cursorDotRef.current.style.opacity = '1';
        cursorTrailRef.current.style.opacity = '1';
      }
    };

    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    
    // 启动动画循环
    requestRef.current = requestAnimationFrame(animateGlow);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return (
    <>
      <div ref={cursorGlowRef} className="cursor-glow" />
      <div ref={cursorDotRef} className="cursor-dot" />
      <div ref={cursorTrailRef} className="cursor-trail" />
    </>
  );
};

export default CursorGlow;
