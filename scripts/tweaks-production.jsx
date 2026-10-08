// Keep public view preferences without shipping the development editor.
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  const setValue = React.useCallback((key, value) => {
    if (key === 'cardStyle' && ['grid', 'list'].includes(value)) {
      setValues(previous => ({ ...previous, cardStyle: value }));
    }
  }, []);
  return [values, setValue];
}
function TweaksPanel() { return null; }
function TweakSection() { return null; }
function TweakSlider() { return null; }
function TweakRadio() { return null; }
function TweakToggle() { return null; }
