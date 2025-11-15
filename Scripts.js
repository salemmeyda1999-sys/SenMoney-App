
var tabNumeros = [
  "+221770348901",
  "+221778900652",
  "+221770077873",
  "+221770899554",
  "+221778900455"
];
var tabSoldes = [7000, 9200, 12000, 7500, 1800];
var tabCodes = ["1004", "2005", "3006", "4007", "5008"];

var historique = [];


var nbreNum = tabNumeros.length;
var numCourant = "";
var indiceCourant = -1;

const fraisTransfert = 0.01; 


var textes = {
  titre: "SenMoney",
  labelNumero: "Choisissez votre numéro :",
  btnCode: "#221#",
  noteInfo: "Sélectionnez un numéro puis cliquez sur #221# pour ouvrir le menu.",
  menuPrompt: "----- MENU SENMONEY ----- \n Taper le numéro du service choisi :\n1. Solde de mon compte\n2. Transfert d'argent\n3. Paiement de facture\n4. Options\n\nEntrez le numéro du service choisi :",
  enterCode: "Entrez votre code secret :",
  codeIncorrect: "Code incorrect !",
  enterDest: "Entrez le numéro du destinataire :",
  numNotFound: "Numéro destinataire non trouvé !",
  enterAmount: "Entrez le montant à transférer :",
  invalidAmount: "Montant invalide !",
  insufficientFunds: "Solde insuffisant !",
  transferSuccess: "Transfert réussi ! Nouveau solde : ",
  backToMenuConfirm: "Voulez-vous retourner au menu principal ?",
  goodbye: "Au revoir ",
  errorLoadingLang: "Erreur lors du chargement du fichier de langue."
};


function isValidPhone(phone) {
  if (typeof phone !== "string") return false;
  if (phone.length < 9) return false;
  if (phone.charAt(0) !== "+") return false;
  for (var i = 1; i < phone.length; i++) {
    var c = phone.charAt(i);
    if (c < "0" || c > "9") return false;
  }
  return true;
}

function toNumber(value) {
  var num = 0;
  var neg = false;
  var i = 0;
  if (value && value[0] === "-") {
    neg = true;
    i = 1;
  }
  for (; i < value.length; i++) {
    var c = value[i];
    if (c >= "0" && c <= "9") {
      num = num * 10 + (c - "0");
    } else {
      return NaN;
    }
  }
  return neg ? -num : num;
}

function chercherIndice(tab, valeur) {
  for (var i = 0; i < tab.length; i++) {
    if (tab[i] === valeur) return i;
  }
  return -1;
}


window.onload = function () {
  remplirSelectNumeros();
  document.getElementById("btnCode").onclick = main;

 
  $("#langSelect").on("change", function () {
    var code = $(this).val().toLowerCase(); 
    chargerLangue(code);
  });

  chargerLangue("donnees_fr"); 
};


function remplirSelectNumeros() {
  var select = document.getElementById("numSelect");
  select.innerHTML = "";
  for (var i = 0; i < tabNumeros.length; i++) {
    var opt = document.createElement("option");
    opt.value = tabNumeros[i];
    opt.textContent = tabNumeros[i];
    select.appendChild(opt);
  }
}


function chargerLangue(codeLangue) {
  var url = codeLangue + ".txt";

  $.ajax({
    url: url,
    dataType: "text",
    cache: false,
    success: function (data) {
      var lignes = [];
      var ligne = "";
      for (var i = 0; i < data.length; i++) {
        var ch = data.charAt(i);
        if (ch === "\n" || ch === "\r") {
          if (ligne !== "") {
            lignes[lignes.length] = ligne;
            ligne = "";
          }
        } else {
          ligne += ch;
        }
      }
      if (ligne !== "") lignes[lignes.length] = ligne;

      var map = {};
      for (var i = 0; i < lignes.length; i++) {
        var l = lignes[i];
        var egal = -1;
        for (var j = 0; j < l.length; j++) {
          if (l[j] === "=") {
            egal = j;
            break;
          }
        }
        if (egal !== -1) {
          var cle = "";
          for (var k = 0; k < egal; k++) cle += l[k];
          var val = "";
          for (var k = egal + 1; k < l.length; k++) val += l[k];
          map[cle] = val;
        }
      }

  
      for (var k in map) {
        var s = "";
        var val = map[k];
        for (var i = 0; i < val.length; i++) {
          if (val[i] === "\\" && i + 1 < val.length && val[i + 1] === "n") {
            s += "\n";
            i++;
          } else {
            s += val[i];
          }
        }
        map[k] = s;
      }

     
      for (var k in textes) {
        if (typeof map[k] !== "undefined") {
          textes[k] = map[k];
        }
      }

      $("#titre").text(textes.titre);
      $("#labelNumero").text(textes.labelNumero);
      $("#btnCode").text(textes.btnCode);
      $("#noteInfo").text(textes.noteInfo);
    },
    error: function () {
      alert(textes.errorLoadingLang);
    }
  });
}

// ------------------- Fonction principale -------------------
function main() {
  numCourant = document.getElementById("numSelect").value;
  if (!isValidPhone(numCourant)) {
    alert("Numéro sélectionné invalide !");
    return;
  }

  indiceCourant = chercherIndice(tabNumeros, numCourant);
  if (indiceCourant === -1) {
    alert("Erreur interne : numéro introuvable.");
    return;
  }

  var service = menu();
  if (service === null) return;

  if (service === "1") {
  afficherSolde();
} else if (service === "2") {
  transferArgent();
} else if (service === "3") {
  payerFacture();
} else if (service === "4") {
  optionsMenu();
} else {
  alert("Service non reconnu.");
}


  etapeSuivant();
}


function menu() {
  var promptText = textes.menuPrompt;
  var rep = prompt(promptText);
  if (rep === null) return null;
  return rep;
}


function afficherSolde() {
  var code = prompt(textes.enterCode);
  if (code === null) return;
  if (code === tabCodes[indiceCourant]) {
    alert(textes.titre + "\n" + "Le solde de votre compte est : " + tabSoldes[indiceCourant] + " F CFA");
  } else {
    alert(textes.codeIncorrect);
  }
}


function transferArgent() {
  var numDest = prompt(textes.enterDest);
  if (numDest === null) return;
  if (!isValidPhone(numDest)) {
    alert("Numéro destinataire invalide !");
    return;
  }

  var indiceDest = chercherIndice(tabNumeros, numDest);
  if (indiceDest === -1) {
    alert(textes.numNotFound);
    return;
  }

  var montantRaw = prompt(textes.enterAmount);
  if (montantRaw === null) return;
  if (montantRaw === "") {
    alert(textes.invalidAmount);
    return;
  }

  var montant = toNumber(montantRaw);
  if (isNaN(montant) || montant <= 0) {
    alert(textes.invalidAmount);
    return;
  }

  var code = prompt(textes.enterCode);
  if (code === null) return;
  if (code !== tabCodes[indiceCourant]) {
    alert(textes.codeIncorrect);
    return;
  }

  var totalDebit = montant + montant * fraisTransfert;
  if (totalDebit > tabSoldes[indiceCourant]) {
    alert(textes.insufficientFunds);
    return;
  }

  tabSoldes[indiceCourant] -= totalDebit;
  tabSoldes[indiceDest] += montant;

  alert(textes.transferSuccess + tabSoldes[indiceCourant] + " F CFA");

  historique[historique.length] =
  "Transfert de " + montant + " F CFA vers " + numDest +
  " (frais : " + (montant * fraisTransfert) + ")";

}


function payerFacture() {
  var ref = prompt("Référence facture : (ex: FACT123)");
  if (ref === null || ref === "") {
    alert("Référence invalide.");
    return;
  }

  var montantRaw = prompt("Montant à payer :");
  if (montantRaw === null) return;
  var montant = toNumber(montantRaw);
  if (isNaN(montant) || montant <= 0) {
    alert("Montant invalide.");
    return;
  }

  var code = prompt(textes.enterCode);
  if (code === null) return;
  if (code !== tabCodes[indiceCourant]) {
    alert(textes.codeIncorrect);
    return;
  }

  if (montant > tabSoldes[indiceCourant]) {
    alert(textes.insufficientFunds);
    return;
  }

  tabSoldes[indiceCourant] -= montant;
  alert("Paiement effectué. Nouveau solde : " + tabSoldes[indiceCourant] + " F CFA");

  historique[historique.length] =
  "Paiement facture " + ref + " : " + montant + " F CFA";

}

function optionsMenu() {
  var rep = prompt(
    "----- OPTIONS -----\n" +
    "1. Historique des transactions\n" +
    "2. Changer le code secret\n\n" +
    "Entrez votre choix :"
  );

  if (rep === null) return;

  if (rep === "1") {
    afficherHistorique();
  } else if (rep === "2") {
    changerCode();
  } else {
    alert("Option invalide !");
  }
}

function afficherHistorique() {
  if (historique.length === 0) {
    alert("Aucune transaction enregistrée.");
    return;
  }

  var texte = "----- HISTORIQUE -----\n";
  for (var i = 0; i < historique.length; i++) {
    texte += (i + 1) + ". " + historique[i] + "\n";
  }

  alert(texte);
}

function changerCode() {
  var ancien = prompt("Entrez votre ancien code :");
  if (ancien === null) return;

  if (ancien !== tabCodes[indiceCourant]) {
    alert("Code incorrect !");
    return;
  }

  var nouveau = prompt("Entrez le nouveau code :");
  if (nouveau === null || nouveau.length === 0) {
    alert("Code invalide !");
    return;
  }

  tabCodes[indiceCourant] = nouveau;
  alert("Code modifié avec succès !");
}




function etapeSuivant() {
  var rep = confirm(textes.backToMenuConfirm);
  if (rep) {
    main();
  } else {
    alert(textes.goodbye);
  }
}
