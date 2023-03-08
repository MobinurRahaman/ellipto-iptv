import { useState, useEffect, useCallback } from "react";

function usePreventBodyScroll() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    hidden ? disableBodyScroll() : enableBodyScroll();

    return enableBodyScroll;
    // eslint-disable-next-line
  }, [hidden]);

  const preventDefault = (ev) => {
    if (ev.preventDefault) {
      ev.preventDefault();
    }
    ev.returnValue = false;
  };

  const enableBodyScroll = () => {
    document && document.removeEventListener("wheel", preventDefault, false);
  };
  const disableBodyScroll = () => {
    document &&
      document.addEventListener("wheel", preventDefault, {
        passive: false,
      });
  };

  const disableScroll = useCallback(() => setHidden(true), []);
  const enableScroll = useCallback(() => setHidden(false), []);
  return { disableScroll, enableScroll };
}

export default usePreventBodyScroll;
