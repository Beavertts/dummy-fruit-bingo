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
  const [images, setImages] = useState([]);

  useEffect(() => {
    // Fetch images from the server when the component mounts
    axios.get('https://fruit-bingo-server-70a1e5dc0205.herokuapp.com/fruitbingoapp/GetImages')
      .then((response) => {
        // Extract fetched images and set them in the state
        const fetchedImages = response.data;
        setImages(fetchedImages);

        // Generate the grid using the fetched images and set it in the state
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
        // Select a random image from the fetched images
        const randomImage = fetchedImages[Math.floor(Math.random() * fetchedImages.length)];
        // Create an <img> element with the selected image and alt text
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

      // Check if all selected cells are in a single row or column
      if (distinctRows.size === 1 || distinctCols.size === 1) {
        // Get the alt values of the selected cells and check if they are all 'apple'
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
      // Cell is already selected, unselect it
      const newSelectedCells = [...selectedCells];
      newSelectedCells.splice(cellIndex, 1);
      setSelectedCells(newSelectedCells);
    } else {
      // Cell is not selected, select it
      setSelectedCells((prevSelectedCells) => [...prevSelectedCells, cell]);
    }
  };

  useEffect(() => {
    // Check for congratulations whenever the selected cells change
    setCongratulations(checkForCongratulations(selectedCells));
  }, [selectedCells]);

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
