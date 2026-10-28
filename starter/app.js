// WSPOLNY KONTRAKT: nazwy zmiennych i funkcji uzgadnia caly zespol.
const MAKS_ENERGIA = 10;
let pokoj = 1;
let energia = MAKS_ENERGIA;
let karta = false;
let bezpiecznik = false;
let zasilanie = false;
let koniec = false;
let wygrana = false;

// SEKCJA 0 — GOTOWY SILNIK NAUCZYCIELA
function start() {
  pokoj = 1;
  energia = MAKS_ENERGIA;
  karta = false;
  bezpiecznik = false;
  zasilanie = false;
  koniec = false;
  wygrana = false;
  console.log("UCIECZKA Z SERWEROWNI. Zasilanie awaryjne wystarczy na 10 tur.");
  pomoc();
  rozejrzyj();
}

function zakonczTure() {
  energia = energia - 1;
  console.log("Pozostala energia: " + energia);
  if (wygrana) {
    console.log("WYGRANA! Drzwi otwarte. Mozesz wrocic do domu.");
  } else if (energia === 0) {
    koniec = true;
    console.log("PRZEGRANA. Zasilanie awaryjne padlo. Wpisz start().");
  }
}

// SEKCJA A — INFORMACJE I MAPA
function nazwaPokoju(numer) {
  // TODO A1: switch; zwroc nazwe pokoju jako tekst.
  switch (numer) {
    case 1: {
      return "Recepcja";
    }
    case 2: {
      return "Magazyn";
    }
    case 3: {
      return "Serwerownia";
    }
    case 4: {
      return "Wyjście";
    }
    default: {
      return "Nieznane pomieszczenie (bijesz głową w ścianę)";
    }
  }
}
function pomoc(stan) {

  return {
    stan,
    komunikat: ['Dostepne: start(), pomoc(), status(), mapa(), rozejrzyj(), idz("prawo"), idz("lewo"), akcja("karta"), akcja("bezpiecznik"), akcja("napraw"), akcja("wyjdz")',
      , "Energie tracisz tylko i wyłacznie wtedy kiedy zrobisz ruch albo wykonasz akcje, jeżeli ruch bedzię prowadził do nikąd, nie tracisz energi.",
    ]
  }
}
function status() {
  // TODO A3: wypisz pokoj, energie, przedmioty, zasilanie i stan gry.
  nazwaPokoju(pokoj);
  console.log(`Aktualna energia: ${energia}`);
  console.log("Karta: " + (karta ? "tak" : "nie"));
  console.log("Bezpiecznik: " + (bezpiecznik ? "tak" : "nie"));
  console.log("Zasilanie: " + (zasilanie ? "tak" : "nie"));
  console.log(
    "Stan gry: " +
    (koniec
      ? "koniec, " + (wygrana ? "wygrałeś!" : "przegrałeś")
      : "w trakcie"),
  );
}
function mapa() {
  // TODO A2: petla for od 1 do 4; nazwa i znacznik aktualnego pokoju.
  for (let i = 1; i <= 4; i++) {
    if (i == pokoj) {
      console.log(`${nazwaPokoju(i)} <-- jesteś tutaj!`);
    } else {
      console.log(nazwaPokoju(i));
    }
  }
}
function rozejrzyj(stan) {
  // TODO A4: switch(pokoj); opis zgodny ze stanem przedmiotow.
  switch (pokoj) {
    case 1: {
      if (!karta) console.log("Karta leży na biurku");
      else console.log("W tym pomieszczeniu nie ma już nic ciekawego");
      break;
    }
    case 2: {
      if (!bezpiecznik && !zasilanie) console.log("Bezpiecznik leży na półce");
      else console.log("W tym pomieszczeniu nie ma już nic ciekawego");
      break;
    }
    case 3: {
      if (zasilanie) console.log("Zasilanie działa");
      else console.log("Zasilanie nie działa");
      break;
    }
    case 4: {
      if (zasilanie && karta)
        console.log("Najwidoczniej wszystko znów działa, możesz wyjść");
      else
        console.log(
          "Musisz przywrócić znów prąd i posiadać kartę aby opuścić szkołę",
        );
      break;
    }
  }
}

// SEKCJA B — RUCH
function idz(kierunek) {
  // TODO B1: zablokuj ruch po koncu gry.
  // TODO B2: switch kierunku; oblicz kandydat na nowy pokoj.
  // TODO B3: odrzuc pokoj poza 1..4 i nieznany kierunek bez kosztu.
  // TODO B4: zapisz poprawny pokoj, rozejrzyj(), zakonczTure().

  if (koniec) {
    console.log("Gra została zakończona");
    return;
  }
  let nastepnyPokoj = pokoj;
  switch (kierunek) {
    case "prawo": {
      nastepnyPokoj++;
      break;
    }
    case "lewo": {
      nastepnyPokoj--;
      break;
    }
    default: {
      return 'Nieznany kierunek, spróbuj "lewo" albo "prawo"';
    }
  }
  if (nastepnyPokoj < 1 || nastepnyPokoj > 4) {
    return "Uderzyłeś w ściane, idz w innym kierunku";
  } else {
    pokoj = nastepnyPokoj;
    rozejrzyj();
    zakonczTure();
  }
}

// SEKCJA C — PRZEDMIOTY I WYGRANA
function akcja(co) {
  // TODO C1: zablokuj akcje po koncu gry.
  if (koniec) return;

  switch (co) {
    case "karta":
      if (pokoj !== 1 || karta) {
        console.log("Tutaj nie ma karty do zabrania.");
        return;
      }
      karta = true;
      console.log("Zabierasz karte.");
      break;
    case "bezpiecznik":
      if (pokoj !== 2 || bezpiecznik || zasilanie) {
        console.log("Tutaj nie ma bezpiecznika do zabrania.");
        return;
      }
      bezpiecznik = true;
      console.log('Zbierasz bezpiecznik');
      break;
    case "napraw":
      if (pokoj !== 3 || zasilanie || !bezpiecznik) {
        console.log("Nie można wykonać tego działania");
        return;
      }
      bezpiecznik = false;
      zasilanie = true;
      console.log('Udało ci się naprawić zasilanie');
      break;
    case "wyjdz":
      if (pokoj !== 4 || !zasilanie || !karta) {
        console.log('Nie można jeszcze wyjść');
        return;
      }
      koniec = true
      wygrana = true;
      break
    default:
      console.log("Nieznana akcja");
      return;
  }

  zakonczTure()
}

start();
