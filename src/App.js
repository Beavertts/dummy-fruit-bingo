import React, { useState, useEffect } from 'react';
import axios from 'axios';

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  table: {
    borderCollapse: 'collapse',
    width: '80%',
    margin: '20px',
  },
  cell: {
    border: '1px solid #ccc',
    padding: '10px',
    textAlign: 'center',
    cursor: 'pointer',
  },
  selectedCell: {
    background: 'lightblue',
  },
  image: {
    height: '30px',
    width: '30px',
  },
  message: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'green',
  },
};

const App = () => {
  const [grid, setGrid] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [congratulations, setCongratulations] = useState(false);

  // Fetch images from the server when the component mounts
  useEffect(() => {
    axios.get('http://localhost:5038/fruitbingoapp/GetImages')
      .then((response) => {
        const fetchedImages = response.data;
        const newGrid = generateGrid(fetchedImages);
        setGrid(newGrid);
      })
      .catch((error) => {
        console.error('Error fetching images from the server:', error);
      });
  }, []);

  // Function to generate the grid with random images
  const generateGrid = (fetchedImages) => {
    return Array.from({ length: 4 }, () =>
      Array.from({ length: 4 }, () => {
        const randomImage = fetchedImages[Math.floor(Math.random() * fetchedImages.length)];
        return <img src={randomImage.image} alt={randomImage.alt} style={styles.image} />;
      })
    );
  };

  // Function to check if the selected cells meet the criteria for congratulations
  const checkForCongratulations = (cells) => {
    if (cells.length === 3) {
      const distinctRows = new Set();
      const distinctCols = new Set();

      cells.forEach((cell) => {
        distinctRows.add(cell.row);
        distinctCols.add(cell.col);
      });

      if (distinctRows.size === 1 || distinctCols.size === 1) {
        const altValues = cells.map((cell) => grid[cell.row][cell.col].props.alt.toLowerCase());
        if (altValues.every((alt) => alt === 'apple')) {
          return true;
        }
      }
    }
    return false;
  };

  // Function to handle cell click
  const handleCellClick = (rowIndex, colIndex) => {
    const cell = { row: rowIndex, col: colIndex };
    const cellIndex = selectedCells.findIndex(
      (selectedCell) =>
        selectedCell.row === rowIndex && selectedCell.col === colIndex
    );

    if (cellIndex !== -1) {
      const newSelectedCells = [...selectedCells];
      newSelectedCells.splice(cellIndex, 1);
      setSelectedCells(newSelectedCells);
    } else {
      setSelectedCells((prevSelectedCells) => [...prevSelectedCells, cell]);
    }
  };

  useEffect(() => {
    // Check for congratulations whenever the selected cells change
    setCongratulations(checkForCongratulations(selectedCells));
  }, [selectedCells, checkForCongratulations]);

  return (
    <div style={styles.container}>
      <table style={styles.table}>
        <tbody>
          {grid.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td
                  key={colIndex}
                  style={{
                    ...styles.cell,
                    ...(selectedCells.some(
                      (selectedCell) =>
                        selectedCell.row === rowIndex &&
                        selectedCell.col === colIndex
                    ) && styles.selectedCell),
                  }}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {congratulations && selectedCells.length === 3 && (
        <div style={styles.message}>Congratulations! You won!</div>
      )}
    </div>
  );
};

export default App;
