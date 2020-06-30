import React, {
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useContext,
  createContext,
  useMemo,
  useRef,
} from "react";
import mojs from "mo-js";
import styles from "./index.css";

const initialState = {
  count: 0,
  countTotal: 276,
  isClicked: false,
};

//Custom hook for animation
const useClapAnimation = ({ clapEl, clapTotalEl, clapCountEl }) => {
  const [animationTimeline, setAnimationTimeline] = useState(
    () => new mojs.Timeline()
  );

  useLayoutEffect(() => {
    if (!clapEl || !clapTotalEl || !clapCountEl) {
      return;
    }

    const tlDuration = 300;
    const scaleButton = new mojs.Html({
      el: clapEl,
      duration: tlDuration,
      scale: { 1.3: 1 },
      easing: mojs.easing.ease.out,
    });

    const countTotalAnimation = new mojs.Html({
      el: clapTotalEl,
      opacity: { 0: 1 },
      delay: (3 * tlDuration) / 2,
      duration: tlDuration,
    });

    const countAnimation = new mojs.Html({
      el: clapCountEl,
      opacity: { 0: 1 },
      duration: tlDuration,
      y: { 0: -30 },
    }).then({
      opacity: { 1: 0 },
      delay: tlDuration / 2,
      y: -80,
    });

    const triangleBurst = new mojs.Burst({
      parent: clapEl,
      radius: { 50: 95 },
      count: 5,
      angle: 30,
      y: { 0: -3 },
      children: {
        shape: "polygon",
        radius: { 6: 0 },
        stroke: "rgba(211, 84, 0,0.5)",
        angle: 210,
        speed: 0.2,
        duration: tlDuration,
        easing: mojs.easing.bezier(0.1, 1, 0.3, 1),
      },
    });

    const circleBurst = new mojs.Burst({
      parent: clapEl,
      angle: 25,
      duration: tlDuration,
      children: {
        shape: "circle",
        fill: "rgba(149, 165, 166, 0.5)",
        delay: 30,
        speed: 0.2,
        radius: { 3: 0 },
        easing: mojs.easing.bezier(0.1, 1, 0.3, 1),
      },
    });

    const newAnimationTimeline = animationTimeline.add([
      scaleButton,
      countTotalAnimation,
      countAnimation,
      triangleBurst,
      circleBurst,
    ]);

    clapEl.style.transform = "scale(1,1)";

    setAnimationTimeline(newAnimationTimeline);
  }, [clapEl, clapTotalEl, clapCountEl]);

  return animationTimeline;
};

const MediumClapContext = createContext();
const { Provider } = MediumClapContext;

const MediumClap = ({ children, onClap }) => {
  const maxUserClap = 50;
  const [clapState, setClapState] = useState(initialState);
  const [{ clapRef, clapCountRef, clapTotalRef }, setRefsState] = useState({});

  const setRef = useCallback((node) => {
    setRefsState((prev) => ({
      ...prev,
      [node.dataset.refkey]: node,
    }));
  }, []);

  const animationTimeline = useClapAnimation({
    clapEl: clapRef,
    clapCountEl: clapCountRef,
    clapTotalEl: clapTotalRef,
  });

  const { count } = clapState;

  const componentJustMounted = useRef(true);
  useEffect(() => {
    if (!componentJustMounted.current) {
      onClap && onClap(clapState);
    }
    componentJustMounted.current = false;
  }, [clapState]);

  const handleClapClick = () => {
    animationTimeline.replay();
    setClapState((prev) => ({
      isClicked: true,
      count: Math.min(prev.count + 1, maxUserClap),
      countTotal: count < maxUserClap ? prev.countTotal + 1 : prev.countTotal,
    }));
  };

  const memonizedValue = useMemo(
    () => ({
      ...clapState,
      setRef,
    }),
    [clapState, setRef]
  );

  return (
    <Provider value={memonizedValue}>
      <button
        ref={setRef}
        data-refkey="clapRef"
        className={styles.clap}
        onClick={handleClapClick}
      >
        {children}
      </button>
    </Provider>
  );
};

// Sub-components
const ClapIcon = () => {
  const { isClicked } = useContext(MediumClapContext);
  return (
    <span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="-549 338 100.1 125"
        className={`${styles.icon} ${isClicked && styles.checked}`}
      >
        <path d="M-471.2 366.8c1.2 1.1 1.9 2.6 2.3 4.1.4-.3.8-.5 1.2-.7 1-1.9.7-4.3-1-5.9-2-1.9-5.2-1.9-7.2.1l-.2.2c1.8.1 3.6.9 4.9 2.2zm-28.8 14c.4.9.7 1.9.8 3.1l16.5-16.9c.6-.6 1.4-1.1 2.1-1.5 1-1.9.7-4.4-.9-6-2-1.9-5.2-1.9-7.2.1l-15.5 15.9c2.3 2.2 3.1 3 4.2 5.3zm-38.9 39.7c-.1-8.9 3.2-17.2 9.4-23.6l18.6-19c.7-2 .5-4.1-.1-5.3-.8-1.8-1.3-2.3-3.6-4.5l-20.9 21.4c-10.6 10.8-11.2 27.6-2.3 39.3-.6-2.6-1-5.4-1.1-8.3z" />
        <path d="M-527.2 399.1l20.9-21.4c2.2 2.2 2.7 2.6 3.5 4.5.8 1.8 1 5.4-1.6 8l-11.8 12.2c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l34-35c1.9-2 5.2-2.1 7.2-.1 2 1.9 2 5.2.1 7.2l-24.7 25.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l28.5-29.3c2-2 5.2-2 7.1-.1 2 1.9 2 5.1.1 7.1l-28.5 29.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.4 1.7 0l24.7-25.3c1.9-2 5.1-2.1 7.1-.1 2 1.9 2 5.2.1 7.2l-24.7 25.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l14.6-15c2-2 5.2-2 7.2-.1 2 2 2.1 5.2.1 7.2l-27.6 28.4c-11.6 11.9-30.6 12.2-42.5.6-12-11.7-12.2-30.8-.6-42.7m18.1-48.4l-.7 4.9-2.2-4.4m7.6.9l-3.7 3.4 1.2-4.8m5.5 4.7l-4.8 1.6 3.1-3.9" />
      </svg>
    </span>
  );
};

const ClapCount = () => {
  const { count, setRef } = useContext(MediumClapContext);
  return (
    <span ref={setRef} data-refkey="clapCountRef" className={styles.count}>
      + {count}
    </span>
  );
};

const CountTotal = () => {
  const { countTotal, setRef } = useContext(MediumClapContext);
  return (
    <span ref={setRef} data-refkey="clapTotalRef" className={styles.total}>
      {countTotal}
    </span>
  );
};

MediumClap.Icon = ClapIcon;
MediumClap.Count = ClapCount;
MediumClap.Total = CountTotal;

// Usage
const Usage = () => {
  const [count, setCount] = useState();
  const handleClap = ({ count }) => {
    setCount(count);
  };
  return (
    <>
      <MediumClap onClap={handleClap}>
        <MediumClap.Icon />
        <MediumClap.Count />
        <MediumClap.Total />
      </MediumClap>
      {!!count && <div>{`You clicked ${count} time`} </div>}
    </>
  );
};

export default Usage;
