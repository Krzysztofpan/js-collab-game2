
const pokoje = [{ id: 1, nazwa: 'Recepcja' }, { id: 2, nazwa: 'Magazyn' }, { id: 3, nazwa: 'Serwerownia' }, { id: 4, nazwa: 'Wyjście' }];
const MAKS_ENERGIA = 10;

let gra = new Proxy({
    stan: stanPoczatkowy(),

    start,
    nazwaPokoju,
    pomoc,
    status,
    mapa,
    rozejrzyj,
    idz,
    zakonczTure,
    wynikGry,
    akcja
}, {
    get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);

        if (typeof value !== "function") {
            return value;
        }

        return function (...args) {
            const { stan, komunikat } = value.call(
                receiver,
                target.stan,
                ...args
            );

            target.stan = stan;

            komunikat.forEach(tekst => console.log(tekst));

            return stan
        };
    }
});

function stanPoczatkowy() {
    return {
        pokoj: 1,
        energia: MAKS_ENERGIA,
        karta: false,
        bezpiecznik: false,
        zasilanie: false,
        koniec: false,
        wygrana: false,
    };
}

function start(stan) {
    const poczatkowyStan = stanPoczatkowy();
    const komunikatPomoc = pomoc(poczatkowyStan).komunikat;
    const komunikatRozejrzyj = rozejrzyj(poczatkowyStan).komunikat;

    return {
        stan: poczatkowyStan,
        komunikat: [
            ...komunikatPomoc,
            ...komunikatRozejrzyj,
            'UCIECZKA Z SERWEROWNI. Zasilanie awaryjne wystarczy na 10 tur.'
        ]
    };
};

function nazwaPokoju(stan, numer) {
    const aktualnyPokoj = pokoje.find(pokoj => pokoj.id === numer);

    if (aktualnyPokoj) {
        return { stan, komunikat: [aktualnyPokoj.nazwa] };
    }

    return {
        stan,
        komunikat: ["Nieznane pomieszczenie (bijesz głową w ścianę)"]
    };
};

function pomoc(stan) {
    const komunikatUno = 'Dostepne: start(), pomoc(), status(), mapa(), rozejrzyj(), idz("prawo"), idz("lewo"), akcja("karta"), akcja("bezpiecznik"), akcja("napraw"), akcja("wyjdz")';
    const komunikatDos = "Energie tracisz tylko i wyłacznie wtedy kiedy zrobisz ruch albo wykonasz akcje, jeżeli ruch bedzię prowadził do nikąd, nie tracisz energi.";

    return { stan, komunikat: [komunikatUno, komunikatDos] };
};

function status(stan) {
    const komunikat = [];
    const pokoj = pokoje.find(pokoj => pokoj.id === stan.pokoj);

    komunikat.push(pokoj ? pokoj.nazwa : "Nieznane pomieszczenie");
    komunikat.push(`Aktualna energia: ${stan.energia}`);
    komunikat.push("Karta: " + (stan.karta ? "tak" : "nie"));
    komunikat.push("Bezpiecznik: " + (stan.bezpiecznik ? "tak" : "nie"));
    komunikat.push("Zasilanie: " + (stan.zasilanie ? "tak" : "nie"));
    komunikat.push(
        "Stan gry: " +
        (stan.koniec
            ? "koniec, " + (stan.wygrana ? "wygrałeś!" : "przegrałeś")
            : "w trakcie")
    );

    return { stan, komunikat };
};

function mapa(stan) {
    const komunikat = [];

    for (let i = 1; i <= 4; i++) {
        const pokoj = pokoje.find(pokoj => pokoj.id === i).nazwa;

        if (i === stan.pokoj) {
            komunikat.push(`${pokoj} <-- jesteś tutaj!`);
        } else {
            komunikat.push(pokoj);
        }
    }

    return { stan, komunikat };
};

function rozejrzyj(stan) {
    let komunikat = null;

    switch (stan.pokoj) {
        case 1: {
            if (!stan.karta) komunikat = "Karta leży na biurku";
            else komunikat = "W tym pomieszczeniu nie ma już nic ciekawego";
            break;
        }
        case 2: {
            if (!stan.bezpiecznik && !stan.zasilanie) komunikat = "Bezpiecznik leży na półce";
            else komunikat = "W tym pomieszczeniu nie ma już nic ciekawego";
            break;
        }
        case 3: {
            if (stan.zasilanie) komunikat = "Zasilanie działa";
            else komunikat = "Zasilanie nie działa";
            break;
        }
        case 4: {
            if (stan.zasilanie && stan.karta) {
                komunikat = "Najwidoczniej wszystko znów działa, możesz wyjść";
            } else {
                komunikat = "Musisz przywrócić znów prąd i posiadać kartę aby opuścić szkołę";
            }
            break;
        }
    }

    return { stan, komunikat: komunikat === null ? [] : [komunikat] };
};


function idz(stan, kierunek) {
    if (stan.koniec) {
        return { stan, komunikat: ["Gra została zakończona"] };
    }

    let nastepnyPokoj = stan.pokoj;

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
            return {
                stan,
                komunikat: ['Nieznany kierunek, spróbuj "lewo" albo "prawo"']
            };
        }
    }

    if (nastepnyPokoj < 1 || nastepnyPokoj > 4) {
        return {
            stan,
            komunikat: ["Uderzyłeś w ściane, idz w innym kierunku"]
        };
    }

    const nowyStan = { ...stan, pokoj: nastepnyPokoj };
    const komunikatRozejrzyj = rozejrzyj(nowyStan).komunikat;

    return zakonczTure(nowyStan, komunikatRozejrzyj);
};

function zakonczTure(stan, dodatkoweKomunikaty = []) {
    const nowyStan = { ...stan, energia: stan.energia - 1 };

    if (nowyStan.energia <= 0) {
        const wynik = wynikGry({ ...nowyStan, energia: 0 });

        return {
            stan: wynik.stan,
            komunikat: [...dodatkoweKomunikaty, ...wynik.komunikat]
        };
    }

    return {
        stan: nowyStan,
        komunikat: [
            ...dodatkoweKomunikaty,
            'Pozostala energia: ' + nowyStan.energia
        ]
    };
}

function wynikGry(stan) {
    if (stan.wygrana) {
        return {
            stan: { ...stan, koniec: true },
            komunikat: ["WYGRANA! Drzwi otwarte. Mozesz wrocic do domu."]
        };
    }

    if (stan.energia <= 0) {
        return {
            stan: { ...stan, energia: 0, koniec: true },
            komunikat: ["PRZEGRANA. Zasilanie awaryjne padlo. Wpisz start()."]
        };
    }

    return { stan, komunikat: [] };
}

function akcja(stan, co) {
    const nowyStan = { ...stan };

    if (nowyStan.koniec) {
        return { stan, komunikat: ["Gra została zakończona"] };
    }

    let komunikat;

    switch (co) {
        case "karta":
            if (nowyStan.pokoj !== 1 || nowyStan.karta) {
                return { stan, komunikat: ["Tutaj nie ma karty do zabrania."] };
            }

            nowyStan.karta = true;
            komunikat = "Zabierasz karte.";
            break;

        case "bezpiecznik":
            if (nowyStan.pokoj !== 2 || nowyStan.bezpiecznik || nowyStan.zasilanie) {
                return { stan, komunikat: ["Tutaj nie ma bezpiecznika do zabrania."] };
            }

            nowyStan.bezpiecznik = true;
            komunikat = "Zbierasz bezpiecznik";
            break;

        case "napraw":
            if (nowyStan.pokoj !== 3 || nowyStan.zasilanie || !nowyStan.bezpiecznik) {
                return { stan, komunikat: ["Nie można wykonać tego działania"] };
            }

            nowyStan.bezpiecznik = false;
            nowyStan.zasilanie = true;
            komunikat = "Udało ci się naprawić zasilanie";
            break;

        case "wyjdz":
            if (nowyStan.pokoj !== 4 || !nowyStan.zasilanie || !nowyStan.karta) {
                return { stan, komunikat: ["Nie można jeszcze wyjść"] };
            }

            nowyStan.wygrana = true;

            return wynikGry(nowyStan);

        default:
            return { stan, komunikat: ["Nieznana akcja"] };
    }

    return zakonczTure(nowyStan, [komunikat]);
};
