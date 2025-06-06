import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import React, {  useContext, useEffect, useState } from 'react'
import { db } from './firebase';
import { AuthContext } from './context/AuthContext';

const Studentver = () => {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [totalMarks, setTotalMarks] = useState(0);
    const {currentUser} = useContext(AuthContext);
    const [showresults, setShowResults] = useState(false);
    const [subm,setSubm] = useState(false);
    const [openPopup, setOpenPopup] = useState(false);
    const [classes, setClasses] = useState([]);
    const [chosenClass, setChosenClass] = useState('');
    const [showQuestions, setShowQuestions] = useState(false);

    const handleAnswerChange = (question, value) => {
        setAnswers((prev) => ({
            ...prev,
            [question]: value,
        }));
    };

    useEffect(() => {
        const fetch = async () => {
            if (subm) {
                const results = questions.map((question) => {
                    const userAnswer = answers[question.question] ?? '';
                    return {
                        question: question.question,
                        userAnswer: userAnswer,
                        isCorrect: userAnswer === question.correctAnswer,
                        mark: userAnswer === question.correctAnswer ? question.mark : 0,
                        correctAnswer: question.correctAnswer
                    };
                });
                console.log('Results:', results);
                const total = results.reduce((acc,result) => acc + Number(result.mark), 0);
                setTotalMarks(total);
                console.log('Total Marks:', total);
                await updateDoc(doc(db, "user", currentUser?.email), {
                    totalMarks: total,
                    results: results,
                    class: chosenClass,
                });
                setSubm(false);
                return;
            }
        }
        fetch();
    }, [subm]);

    //fetching classes
    useEffect(() => {
        const fetch = async () => {
            const querySnapshot = await getDocs(collection(db, "all classes"));
            const classArray = [];
            querySnapshot.forEach((doc) => {
                classArray.push(doc.id);
            });
            setClasses(classArray);
            console.log('Classes fetched:', classArray);
        };
        fetch();
    }, []);

    useEffect(() => {
        if (!chosenClass) return;
        const fetch = async () => {
            // const querySnapshot = await getDocs(collection(db, "questions"));
            // const questionsArray = [];
            // querySnapshot.forEach((doc) => {
            // questionsArray.push(doc.data());
            // });
            // setQuestions(questionsArray);
            const querySnapshot = await getDocs(collection(db, "all classes", chosenClass, "questions"));
            const questionsArray = [];
            querySnapshot.forEach((doc) => {
            questionsArray.push({ id: doc.id, ...doc.data() });
            });
            console.log('Questions fetched:', questionsArray);
            setQuestions(questionsArray);
        };
        fetch();
    }, [chosenClass]);
  return (
    <>
        <div className='w-full h-auto flex justify-center items-center p-20 pb-0 gap-4 flex-wrap flex-row-reverse'>
            {
                classes.map((name, index) => (
                    <button key={index} className='rounded-s border p-2 pl-4 pr-4 bg-blue-200 shadow-md' onClick={() => {setChosenClass(name);setShowQuestions(true); setShowResults(false); setAnswers({})}}>
                        {name}
                    </button>
                ))
            }
        </div>
        {
            showQuestions ? (
                <div className='w-full h-full flex justify-center items-center p-20 flex-col gap-4'>
                    <h1 className='text-2xl font-bold text-center'>Student Version</h1>
                    <p className='text-center'>This is the student version of the exam application.</p>
                    <p className='text-center'>Students can view their results and answers here.</p>
                    {
                        showresults ? (answers.length === 0  ? <p>Oops! You haven't answer any question yet!</p> : (
                            <div className='flex flex-col gap-4'>
                                <h1 className='text-xl font-bold text-center'>Total Marks: {totalMarks}</h1>
                                <div>
                                    <h2 className='text-lg font-semibold'>Results:</h2>
                                    <ul className=' flex flex-col gap-4'>
                                        {questions.map((question, index) => (
                                            <li key={index} className='flex flex-col justify-center items-center gap-1 w-96 p-4 shadow-md rounded' style={{backgroundColor: question.correctAnswer===answers[question.question] ? 'lightgreen' : 'lightcoral'}}>
                                                <p className='bg-white w-full p-2 rounded-sm'><strong>Question:</strong> {question.question}</p>
                                                <p className='bg-white w-full p-2 rounded-sm'><strong>Your Answer:</strong> {answers[question.question]}</p>
                                                <p className='bg-white w-full p-2 rounded-sm'><strong>Correct Answer:</strong> {question.correctAnswer}</p>
                                                <p className='bg-white w-full p-2 rounded-sm'><strong>Marks:</strong> {question.correctAnswer===answers[question.question] ? question.mark : '0'}</p>
                                                <hr />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <button className='p-3 bg-blue-200 rounded-md' onClick={() => {setShowResults(false); setAnswers({})}}>Back to answer</button>
                            </div>
                        )) : <form onSubmit={(e) => {
                            e.preventDefault();
                            setOpenPopup(true);
                        }} className="flex flex-col gap-4 w-full items-center">
                        {questions.map((data, index) => (
                            data.type ==='multiple-choice' ? (
                                <div
                                    key={index}
                                    className='flex flex-col justify-center items-center gap-4 w-96 p-4 bg-blue-200 shadow-md rounded'
                                >
                                    <label className='text-md font-bold'>{data.question}</label>
                                    <ul className='grid grid-cols-2 gap-4 w-full'>
                                        <li className='flex items-center gap-2'>
                                            <input
                                                type='radio'
                                                name={`question-${index}`}
                                                value={data.answer1}
                                                checked={answers[data.question] === data.answer1}
                                                onChange={(e) => handleAnswerChange(data.question, e.target.value)}
                                            />
                                            <label>{data.answer1}</label>
                                        </li>
                                        <li className='flex items-center gap-2'>
                                            <input
                                                type='radio'
                                                name={`question-${index}`}
                                                value={data.answer2}
                                                checked={answers[data.question] === data.answer2}
                                                onChange={(e) => handleAnswerChange(data.question, e.target.value)}
                                            />
                                            <label>{data.answer2}</label>
                                        </li>
                                        <li className='flex items-center gap-2'>
                                            <input
                                                type='radio'
                                                name={`question-${index}`}
                                                value={data.answer3}
                                                checked={answers[data.question] === data.answer3}
                                                onChange={(e) => handleAnswerChange(data.question, e.target.value)}
                                            />
                                            <label>{data.answer3}</label>
                                        </li>
                                        <li className='flex items-center gap-2'>
                                            <input
                                                type='radio'
                                                name={`question-${index}`}
                                                value={data.answer4}
                                                checked={answers[data.question] === data.answer4}
                                                onChange={(e) => handleAnswerChange(data.question, e.target.value)}
                                            />
                                            <label>{data.answer4}</label>
                                        </li>
                                    </ul>
                                </div>
                            ) : data.type ==='fill-in-the-blank' ? (
                                <div
                                    key={index}
                                    className='flex flex-col justify-center items-center gap-4 w-96 p-4 bg-blue-200 shadow-md rounded'
                                >
                                    <label className='text-md font-bold'>{data.question}</label>
                                    <textarea
                                        placeholder='Answer here...'
                                        className='w-full p-2 border border-gray-300 rounded'
                                        name={data.question}
                                        value={answers[data.question] || ''}
                                        onChange={(e) => handleAnswerChange(data.question, e.target.value)}
                                    />
                                </div>
                            ) : (
                                <div
                                    key={index}
                                    className='flex flex-col justify-center items-center gap-4 w-96 p-4 bg-blue-200 shadow-md rounded'
                                >
                                    <label className='text-md font-bold'>{data.question}</label>
                                    <ul className='flex justify-center items-center gap-3'>
                                        <li className='flex items-center gap-2'>
                                            <input
                                                type='radio'
                                                name={`truefalse-${index}`}
                                                onChange={(e) => handleAnswerChange(data.question,'true')}
                                            />
                                            <label>True</label>
                                        </li>
                                        <li className='flex items-center gap-2'>
                                            <input
                                                type='radio'
                                                name={`truefalse-${index}`}
                                                onChange={(e) => handleAnswerChange(data.question,'false')}
                                            />
                                            <label>False</label>
                                        </li>
                                    </ul>
                                </div>
                            )
                        ))}

                        <button
                            type="submit"
                            className="mt-4 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Submit Answers
                        </button>
                    </form>
                    }
                    
                    {
                        openPopup && (
                            <div className={`fixed top-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center `}>
                                <div className=' flex flex-col justify-center align-middle gap-4 w-96 h-40 p-4 bg-gray-200 shadow-md rounded'>
                                    <h1 className='text-center font-bold '>Submit Answer!</h1>
                                    <div className='flex justify-center items-center gap-4'>
                                        <button className='bg-green-500 text-white p-2 rounded' onClick={() => {setSubm(true);setOpenPopup(false);setShowResults(true)}}>Submit</button>
                                        <buttion className='bg-blue-500 text-white p-2 rounded cursor-pointer' onClick={() => setOpenPopup(false)}>Cancle</buttion>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </div>
            ) : <h2 className='w-full text-center p-9'>Please choose your class first!</h2>
        }
    </>
  )
}

export default Studentver