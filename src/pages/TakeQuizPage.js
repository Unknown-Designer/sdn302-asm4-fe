import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchQuizById, clearCurrentQuiz } from '../store/slices/quizSlice';
import { Container, Card, Button, Form, Alert, Spinner, ProgressBar, Badge } from 'react-bootstrap';

const TakeQuizPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentQuiz, isLoading } = useSelector((state) => state.quizzes);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    dispatch(fetchQuizById(id));
    return () => {
      dispatch(clearCurrentQuiz());
    };
  }, [dispatch, id]);

  const handleOptionSelect = (questionId, optionIndex) => {
    if (!submitted) {
      setAnswers({ ...answers, [questionId]: optionIndex });
    }
  };

  const handleSubmit = () => {
    let correctCount = 0;
    currentQuiz.questions.forEach((question) => {
      if (answers[question._id] === question.correctAnswerIndex) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (currentIndex < currentQuiz.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (isLoading || !currentQuiz) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!currentQuiz.questions || currentQuiz.questions.length === 0) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">This quiz has no questions yet.</Alert>
        <Button variant="secondary" onClick={() => navigate('/quizzes')}>
          Back to Quizzes
        </Button>
      </Container>
    );
  }

  const totalQuestions = currentQuiz.questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;
  const question = currentQuiz.questions[currentIndex];

  if (submitted) {
    return (
      <Container className="mt-4">
        <Card className="shadow">
          <Card.Body className="text-center">
            <h2>Quiz Complete!</h2>
            <h3 className="my-4">{currentQuiz.title}</h3>
            <div className="display-4 mb-3">
              <Badge bg={score >= totalQuestions / 2 ? 'success' : 'danger'}>
                {score} / {totalQuestions}
              </Badge>
            </div>
            <p className="lead">
              You scored {Math.round((score / totalQuestions) * 100)}%
            </p>

            <h5 className="mt-4 mb-3">Review Answers:</h5>
            {currentQuiz.questions.map((q, idx) => {
              const userAnswer = answers[q._id];
              const isCorrect = userAnswer === q.correctAnswerIndex;
              return (
                <Card key={q._id} className={`mb-3 text-start border-${isCorrect ? 'success' : 'danger'}`}>
                  <Card.Body>
                    <Card.Title>
                      Q{idx + 1}: {q.text}
                      {isCorrect ? (
                        <Badge bg="success" className="ms-2">Correct</Badge>
                      ) : (
                        <Badge bg="danger" className="ms-2">Incorrect</Badge>
                      )}
                    </Card.Title>
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className={`p-2 mb-1 rounded ${optIdx === q.correctAnswerIndex
                            ? 'bg-success text-white'
                            : optIdx === userAnswer && !isCorrect
                              ? 'bg-danger text-white'
                              : ''
                          }`}
                      >
                        {opt}
                        {optIdx === q.correctAnswerIndex && ' (Correct Answer)'}
                        {optIdx === userAnswer && !isCorrect && ' (Your Answer)'}
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              );
            })}

            <Button variant="primary" onClick={() => navigate('/quizzes')} className="mt-3">
              Back to Quizzes
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card className="shadow">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">{currentQuiz.title}</h4>
          <small>{currentQuiz.description}</small>
        </Card.Header>
        <Card.Body>
          <div className="d-flex justify-content-between mb-3">
            <span>
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span>Answered: {answeredCount} / {totalQuestions}</span>
          </div>
          <ProgressBar now={progress} label={`${Math.round(progress)}%`} className="mb-4" />

          <Card className="mb-4">
            <Card.Body>
              <Card.Title className="mb-3">{question.text}</Card.Title>
              <Form>
                {question.options.map((option, optIdx) => (
                  <Form.Check
                    key={optIdx}
                    type="radio"
                    id={`option-${question._id}-${optIdx}`}
                    name={`question-${question._id}`}
                    label={option}
                    checked={answers[question._id] === optIdx}
                    onChange={() => handleOptionSelect(question._id, optIdx)}
                    className="mb-2 p-2 ps-5 border rounded"
                  />
                ))}
              </Form>
            </Card.Body>
          </Card>

          <div className="d-flex justify-content-between">
            <Button
              variant="secondary"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>
            <div>
              {currentIndex < totalQuestions - 1 ? (
                <Button variant="primary" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button
                  variant="success"
                  onClick={handleSubmit}
                  disabled={answeredCount < totalQuestions}
                >
                  Submit Quiz
                </Button>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TakeQuizPage;
