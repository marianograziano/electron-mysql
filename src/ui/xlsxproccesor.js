const XLSX = require('xlsx');

function extraerFecha(texto) {
    try {
        const patron = /(\d{1,2}) DE (\w+) DE (\d{4})/i;
        const match = texto.match(patron);
        if (match) {
            let [_, dia, mes, ano] = match;
            const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
                           'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
            mes = mes.toUpperCase();
            if (mes === "SETIEMBRE") mes = "SEPTIEMBRE";
            const mesNumero = meses.indexOf(mes) + 1;
            const fecha = new Date(ano, mesNumero - 1, dia);
            return fecha;
        } else {
            return "No se puede extraer la fecha.";
        }
    } catch (error) {
        return "No se puede extraer la fecha debido a un error en el formato.";
    }
}

function imprimirTipo(cadena) {
    const patronUnipolar = /^U\d/;
    const patronUnipolarBobina = /^UB\d/;
    const patronParalelo = /^P\d/;
    const patronBipolarRojoNegro = /^B\d/;
    const patronTipoTaller = /^T\d/;
    const patronTipoTallerBobina = /^TB\d/;
    const patronTipoSubterraneo = /^S\d/;

    if (patronUnipolarBobina.test(cadena)) {
        return "Unipolar bobina";
    } else if (patronUnipolar.test(cadena)) {
        return "Unipolar";
    } else if (patronParalelo.test(cadena)) {
        return "Paralelo";
    } else if (patronBipolarRojoNegro.test(cadena)) {
        return "Bipolar rojo negro";
    } else if (patronTipoTaller.test(cadena)) {
        return "Tipo Taller Envainado";
    } else if (patronTipoTallerBobina.test(cadena)) {
        return "Tipo taller Envainado Bobina";
    } else if (patronTipoSubterraneo.test(cadena)) {
        return "Subterraneo Flexible";
    } else {
        return "No coincide";
    }
}

/**
 * Encuentra las celdas en la hoja de cálculo que contienen las subcadenas especificadas.
 * 
 * @param {Object} worksheet - El objeto de la hoja de cálculo.
 * @param {Object} substrings - Un objeto con claves como subcadenas a buscar.
 * @returns {Object|null} - Un objeto con las celdas encontradas para cada subcadena, o null si no se encuentra ninguna.
 * Ejemplo: findCellsContainingSubstrings(worksheet, { fruta: 'manzana', color: 'rojo' });
 */
function findCellsContainingSubstrings(worksheet, substrings) {
    const foundCells = {};

    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
        for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
            const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: colNum });
            const cellValue = worksheet[cellAddress]?.v;
            if (typeof cellValue === 'string') {
                for (const key in substrings) {
                    const substring = substrings[key];
                    if (cellValue.includes(substring)) {
                        if (!foundCells[key]) {
                            foundCells[key] = [];
                        }
                        foundCells[key].push(cellAddress);
                    }
                }
            }
        }
    }

    return Object.keys(foundCells).length > 0 ? foundCells : null;
}

function obtenerValoresDinamicos(sheet, celdaInicial) {
        // Determina la fila y columna de la celda inicial
        const match = celdaInicial.match(/([A-Z]+)(\d+)/);
        const colInicio = match[1];
        const filaInicio = parseInt(match[2]) + 1; // Incrementa para obtener la fila inmediatamente posterior
      
        // Obtiene los códigos de columna ASCII para manejar dinámicamente las columnas
        const colInicioCode = colInicio.charCodeAt(0);
      
        // Construye las referencias de celdas para los valores a extraer
        const celdas = Array.from({ length: 3 }, (_, i) => {
          // Convierte el código ASCII de vuelta a letra y concatena con la filaInicio para formar la referencia de celda
          return `${String.fromCharCode(colInicioCode + i)}${filaInicio}`;
        });
      
        // Extrae los valores
        const valores = celdas.map(celda => sheet[celda] ? sheet[celda].v : null);
      
        // Devuelve un objeto con los valores; ajusta las claves según sea necesario
        return {
          valor1: valores[0],
          valor2: valores[1],
          valor3: valores[2],
        };
    }

let referenciasProveedor ={
    encabezado: 'LISTA DE PRECIOS',
    primerColumnaPrecios: ' UNIPOLAR FLEXIBLE  IRAM NM 247-3',
    segundaColumnaPrecios: 'TIPO TALLER ENVAINADO REDONDO  IRAM 247-5',
    terceraColumnaPrecios: 'SUBTERRANEO IRAM 2178-1 CAT II CLASE  IV-VI',
  }


document.getElementById('reset-btn').addEventListener('click', function() {
    // Limpiar el input del archivo
    const inputFile = document.getElementById('input-file');
    inputFile.value = ''; // Esto limpiará el archivo seleccionado previamente

    // Opcionalmente, limpia cualquier dato mostrado, como una tabla de salida
    const table = document.getElementById('data-output');
    if (table) {
        table.innerHTML = ''; // Esto limpiará la tabla de datos
    }

    // También puedes restablecer cualquier otra parte de la UI aquí, si es necesario
    console.log('Formulario reseteado . Listo para cargar un nuevo archivo.');
});


document.getElementById('submit-btn').addEventListener('click', () => {
    //console.log('Botón clickeado');
    
    const inputFile = document.getElementById('input-file');
    if (inputFile.files.length === 0) {
        console.log('No se seleccionó archivo');
        alert('Por favor, selecciona un archivo.');
        return;
    }

    const file = inputFile.files[0];
    console.log('Archivo seleccionado:', file.name);

    const reader = new FileReader();

    reader.onload = (evt) => {
        console.log('Archivo leído');

        try {
            const data = evt.target.result;
            const workbook = XLSX.read(data, {type: 'binary'});
            console.log('Libro parseado:', workbook);
            let fecha = new Date();
            const firstSheetName = workbook.SheetNames[0];
           // console.log('Nombre de la primera hoja:', firstSheetName);

            const worksheet = workbook.Sheets[firstSheetName];
            celdasReferencia = findCellsContainingSubstrings(worksheet, referenciasProveedor);
            const headerCellValue = celdasReferencia.encabezado;
           console.log('headerCellValue -> ', headerCellValue);
            //const priceListStartedCell = findCellWithSubstring(worksheet, ' UNIPOLAR FLEXIBLE  IRAM NM 247-3');
            console.log('Celda donde empieza la lista de precios:', celdasReferencia.primerColumnaPrecios);
            
           if (headerCellValue != null)  {
            fecha = extraerFecha(worksheet[headerCellValue].v)
            console.log('Fecha extraída:', fecha);
            } else {console.log(headerCellValue);
                console.error('No se pudo extraer la fecha');

            }
            const valores = obtenerValoresDinamicos(worksheet, priceListStartedCell.cell); // Cambia 'A14' por la celda inicial deseada
            console.log('Valores extraídos:', valores)


            const valores1 = obtenerValoresDinamicos(worksheet, 'B15'); // Cambia 'A14' por la celda inicial deseada
            console.log('Valores extraídos B15:', valores1)

            const range = `${priceListStartedCell.cell}:D55`;
            console.log('Rango especificado:', range); // 

            const jsonData = XLSX.utils.sheet_to_json(worksheet, {range: range, header:1});
            console.log('Datos JSON:', jsonData);

            const table = document.getElementById('data-output');
            table.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos datos
            jsonData.forEach((row, rowIndex) => {
                console.log(`Fila ${rowIndex}:`, row);
                const tr = document.createElement('tr');
                row.forEach((cell) => {
                    const td = document.createElement('td');
                    td.textContent = cell;
                    tr.appendChild(td);
                });
                table.appendChild(tr);
            });
        } catch (error) {
            console.error('Error procesando el archivo:', error);
            alert('Error al procesar el archivo. Verifica la consola para más detalles.');
        }
    };

    reader.onerror = (error) => {
        console.error('Error al leer el archivo:', error);
    };

    // Lee el archivo como binario
    reader.readAsBinaryString(file);
});

