import "./summary.css";
import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";

// export default function TableResults({ goodWords, wrongWords }) {
//   return (
//     <div className="results">
//       <div className="good-results">
//         <span className="results-title">good</span>
//         <InfiniteScroll
//           className="table-results"
//           dataLength={goodWords.length}
//           loader={<h4>Loading...</h4>}
//           endMessage={<div className="endMessage"></div>}
//           scrollableTarget="scrollableDiv"
//         >
//           <table>
//             <thead className="good-thead">
//               <tr>
//                 <th>PL</th>
//                 <th>ENG</th>
//               </tr>
//             </thead>
//             <tbody>
//               {goodWords.map((goodWord) => (
//                 <tr key={goodWord.id} id={`word-${goodWord.id}`}>
//                   <td>{goodWord.wordPl.word}</td>
//                   <td>{goodWord.wordEng.word}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </InfiniteScroll>
//       </div>

//       <div className="wrong-results">
//         <span className="results-title">wrong</span>
//         <InfiniteScroll
//           dataLength={wrongWords.length}
//           loader={<h4>Loading...</h4>}
//           className="table-results"
//           endMessage={<div className="endMessage"></div>}
//           scrollableTarget="scrollableDiv"
//         >
//           <table>
//             <thead className="wrong-thead">
//               <tr>
//                 <th>PL</th>
//                 <th>ENG</th>
//               </tr>
//             </thead>
//             <tbody>
//               {wrongWords.map((wrongWord) => (
//                 <tr key={wrongWord.id} id={`word-${wrongWord.id}`}>
//                   <td>{wrongWord.wordPl.word}</td>
//                   <td>{wrongWord.wordEng.word}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </InfiniteScroll>
//       </div>
//     </div>
//   );
// }

export default function TableResults({ goodWords, wrongWords }) {
  return (
    <div className="results">
      {/* Warunkowe renderowanie dla goodWords */}
      {goodWords.length > 0 && (
        <div className="good-results">
          <span className="results-title">good</span>
          <InfiniteScroll
          className="table-results"
          dataLength={goodWords.length}
          loader={<h4>Loading...</h4>}
          endMessage={<div className="endMessage"></div>}
          scrollableTarget="scrollableDiv"
        >
          <table>
            <thead className="good-thead">
              <tr>
                <th>PL</th>
                <th>ENG</th>
              </tr>
            </thead>
            <tbody>
              {goodWords.map((goodWord) => (
                <tr key={goodWord.id} id={`word-${goodWord.id}`}>
                  <td>{goodWord.wordPl.word}</td>
                  <td>{goodWord.wordEng.word}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </InfiniteScroll>
        </div>
      )}

      {/* Warunkowe renderowanie dla wrongWords */}
      {wrongWords.length > 0 && (
        <div className="wrong-results">
          <span className="results-title">wrong</span>
          <InfiniteScroll
          dataLength={wrongWords.length}
          loader={<h4>Loading...</h4>}
          className="table-results"
          endMessage={<div className="endMessage"></div>}
          scrollableTarget="scrollableDiv"
        >
          <table>
            <thead className="wrong-thead">
              <tr>
                <th>PL</th>
                <th>ENG</th>
              </tr>
            </thead>
            <tbody>
              {wrongWords.map((wrongWord) => (
                <tr key={wrongWord.id} id={`word-${wrongWord.id}`}>
                  <td>{wrongWord.wordPl.word}</td>
                  <td>{wrongWord.wordEng.word}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </InfiniteScroll>
        </div>
      )}
    </div>
  );
}
