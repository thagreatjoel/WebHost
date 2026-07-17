export const navigateWithOutro = (router, path, pageShellRef, setIsRedirecting) => {
  if (setIsRedirecting) {
    setIsRedirecting(true);
  }
  
  // Add the zoom-out animation class
  if (pageShellRef?.current) {
    pageShellRef.current.classList.add('zoom-in-big');
  }
  
  // Navigate after animation completes
  setTimeout(() => {
    router.push(path);
  }, 800);
};