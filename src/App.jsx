import React, { useEffect, useState } from "react";
import {BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Pie, PieChart, Cell, ResponsiveContainer} from "recharts";
import "./App.css"

function App() {
    const [questions, setQuestions] = useState([]);
    const [categoriesStats, setCategoriesStats] = useState([])
    const [difficultyStats, setDifficultyStats] = useState([])
    const [selectedCategory, setSelectedCategory] = useState("All")

    const colors = {
        easy: "#00C49F",
        medium: "#FFBB28",
        hard: "#FF8042"
    }

    useEffect(() => {
        fetch("https://opentdb.com/api.php?amount=50")
            .then((res) => res.json())
            .then((data) => {
                setQuestions(data.results);
                const questionCounter = {}
                data.results.forEach(q => {
                    const category = q.category.replace("&amp;", "&")
                    if (questionCounter[category]) {
                        questionCounter[category] += 1
                    } else {
                        questionCounter[category] = 1
                    }
                })

                const fixedData = Object.entries(questionCounter).map(([category, count]) => ({
                    name: category,
                    total: count
                }))
                setCategoriesStats(fixedData)

                const difficultyCounter = {"easy": 0, "medium": 0, "hard": 0}
                data.results.forEach(d => difficultyCounter[d.difficulty]++)

                const difficultyStats = Object.entries(difficultyCounter).map(([name, value]) => ({
                    name,
                    value,
                }));
                setDifficultyStats(difficultyStats)
            })
            .catch((err) => console.error(err));
    }, []);

    const updateDifficultyStats = (data) => {
        const difficultyCounter = { easy: 0, medium: 0, hard: 0 };
        data.forEach((d) => (difficultyCounter[d.difficulty] += 1));

        const difficultyStats = Object.entries(difficultyCounter).map(
            ([name, value]) => ({
                name,
                value,
            })
        );
        setDifficultyStats(difficultyStats);
    };

    useEffect(() => {
        if (selectedCategory === "All") {
            updateDifficultyStats(questions);
        } else {
            const filtered = questions.filter(
                (q) => q.category.replace("&amp;", "&") === selectedCategory
            );
            updateDifficultyStats(filtered);
        }
    }, [selectedCategory, questions]);

    let difficultyTitle = "";

    if (selectedCategory === "All") {
        difficultyTitle = "Difficulty Distribution (All Categories)";
    } else {
        difficultyTitle = `Difficulty in ${selectedCategory}`;
    }


    return (
        <div className="dashboard">
            <div className="filter-bar">
                <label htmlFor="category">Filter by category: </label>
                <select
                    id="category"
                    value={selectedCategory}
                    onChange={(s) => setSelectedCategory(s.target.value)}
                >
                    <option value="All">All Categories</option>
                    {categoriesStats.map((c) => (
                        <option key={c.name} value={c.name}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>
                <div className="charts-row">
                    <div className="chart-card">
                        <h2>Questions per Category</h2>
                        <div style={{ width: "95%", height: categoriesStats.length * 30 + 100, margin: "0 auto" }}>
                            <ResponsiveContainer>
                                <BarChart
                                    layout={"vertical"}
                                    data={categoriesStats}
                                    margin={{ top: 20, bottom: 10 }}
                                    barCategoryGap="20%"

                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={300} />
                                    <Tooltip />
                                    <Legend verticalAlign="top" align="center" wrapperStyle={{ top: 0 }} />
                                    <Bar
                                        dataKey="total"
                                        name="Number of Questions"
                                        fill="#8884d8"
                                        activeBar={<Rectangle fill="pink" stroke="blue" strokeWidth={2} />}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="chart-card" style={{ width: 400, height: 575}}>
                        <h2>
                            {difficultyTitle}
                        </h2>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={difficultyStats}
                                    innerRadius="70%"
                                    outerRadius="100%"
                                    cornerRadius={10}
                                    paddingAngle={5}
                                    dataKey="value"
                                    labelLine={false}
                                    label={({ cx, cy }) => {
                                        const total = difficultyStats.reduce((sum, entry) => sum + entry.value, 0);
                                        return (
                                            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="16">
                                                Total: {total}
                                            </text>
                                        );
                                    }}
                                >
                                    {difficultyStats.map((entry) => (
                                        <Cell key={entry.name} fill={colors[entry.name]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" align="center" wrapperStyle={{ top: 0 }} />
                            </PieChart>
                        </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default App;