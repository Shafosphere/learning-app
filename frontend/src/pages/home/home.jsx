import "./home.css"
import Flashcard from "../../components/home/card/flashcard"
import { data } from "../../data/data"
import { useState } from "react";
export default function Home(){
    let wordNumber = 20;
    const[wordsData, setWord ] = useState(data.slice(0, wordNumber))
    const[randomWord, setRandom] = useState('');
    return (
        <div className="container-home">
            <div className="window-home">
                <Flashcard data={wordsData}/>
            </div>
        </div>
    )
}