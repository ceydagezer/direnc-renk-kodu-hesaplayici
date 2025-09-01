// Kısayollar
const $ = (id) => document.getElementById(id);
const band = (n) => $(`band${n}`);

const state = { mode: 4 }; // 4 | 5 | 6

const selects = {
  d1: $("d1"),
  d2: $("d2"),
  d3: $("d3"),
  multiplier: $("multiplier"),
  tolerance: $("tolerance"),
  tempco: $("tempco"),
};

const wrappers = {
  d3: $("d3-wrap"),
  tempco: $("tempco-wrap"),
};

const out = {
  valueText: $("valueText"),
  rangeText: $("rangeText"),
  tempcoLine: $("tempcoLine"),
  tempcoText: $("tempcoText"),
};

// Bantları boyama
function setBandColor(bandIndex, cssToken) {
  const el = band(bandIndex);
  el.className = `band band-${bandIndex}`; // sıfırla
  el.classList.add(`color-${cssToken}`);
}

// Kullanıcı dostu birim
function formatOhms(ohms) {
  if (ohms >= 1e9) return (ohms/1e9).toFixed(2).replace(/\.00$/,"") + " GΩ";
  if (ohms >= 1e6) return (ohms/1e6).toFixed(2).replace(/\.00$/,"") + " MΩ";
  if (ohms >= 1e3) return (ohms/1e3).toFixed(2).replace(/\.00$/,"") + " kΩ";
  return `${Number(ohms.toFixed(2))} Ω`;
}

// Bantları konumlandır (mode'a göre yüzdeler)
function positionBands() {
  const res = $("resistor");
  const percByMode = {
    4: [8, 20, 46, 66],              // 1,2, çarpan, tolerans
    5: [8, 18, 28, 48, 66],          // 1,2,3, çarpan, tolerans
    6: [6, 16, 26, 44, 60, 74],      // 1,2,3, çarpan, tolerans, tempco
  };
  const active = percByMode[state.mode];
  // Hepsini önce gizle
  for (let i=1;i<=6;i++){ band(i).style.display = "none"; }
  // Kullanılacaklar:
  active.forEach((p, idx) => {
    const el = band(idx+1);
    el.style.display = "block";
    el.style.left = `calc(14% + 12px + ${p}%)`;
  });

  // Görselde core zaten var
  res.dataset.mode = state.mode;
}

// Hesaplama ve görsele yansıtma
function calculateAndRender() {
  const d1 = Number(selects.d1.value);
  const d2 = Number(selects.d2.value);
  const mult = Number(selects.multiplier.value);
  const tol = Number(selects.tolerance.value);

  // Bant renklerini uygula
  setBandColor(1, selects.d1.selectedOptions[0].dataset.color);
  setBandColor(2, selects.d2.selectedOptions[0].dataset.color);

  let baseDigits = 0;

  if (state.mode === 4) {
    // (10*d1 + d2)
    baseDigits = 10 * d1 + d2;
    setBandColor(3, selects.multiplier.selectedOptions[0].dataset.color);
    setBandColor(4, selects.tolerance.selectedOptions[0].dataset.color);
  } else {
    const d3 = Number(selects.d3.value);
    setBandColor(3, selects.d3.selectedOptions[0].dataset.color);
    setBandColor(4, selects.multiplier.selectedOptions[0].dataset.color);
    setBandColor(5, selects.tolerance.selectedOptions[0].dataset.color);

    // (100*d1 + 10*d2 + d3)
    baseDigits = 100 * d1 + 10 * d2 + d3;

    if (state.mode === 6) {
      setBandColor(6, selects.tempco.selectedOptions[0].dataset.color);
    }
  }

  const base = baseDigits * mult;
  const min = base * (1 - tol/100);
  const max = base * (1 + tol/100);

  out.valueText.textContent = `${formatOhms(base)} ± ${tol}%`;
  out.rangeText.textContent = `${formatOhms(min)} – ${formatOhms(max)}`;

  // 6 bantta sıcaklık katsayısını göster
  if (state.mode === 6) {
    out.tempcoLine.style.display = "";
    out.tempcoText.textContent = selects.tempco.value;
  } else {
    out.tempcoLine.style.display = "none";
  }
}

// Sekme (tab) değişimi
function setMode(newMode) {
  state.mode = newMode;

  // Sekme görünümü
  document.querySelectorAll(".tab").forEach(btn=>{
    const active = Number(btn.dataset.mode) === newMode;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", String(active));
  });

  // Form alanlarını görünürlük
  wrappers.d3.classList.toggle("hidden", newMode === 4);
  wrappers.tempco.classList.toggle("hidden", newMode !== 6);

  // Bantları konumlandır + hesapla
  positionBands();
  calculateAndRender();
}

// Olaylar
Object.values(selects).forEach(sel => sel.addEventListener("change", calculateAndRender));
document.querySelectorAll(".tab").forEach(btn=>{
  btn.addEventListener("click", ()=> setMode(Number(btn.dataset.mode)));
});

// İlk kurulum
positionBands();
calculateAndRender();
