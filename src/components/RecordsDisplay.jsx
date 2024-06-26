import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import "../App.css";
import { setNotification } from '../reducers/notificationReducer';
import HighlightFilteredWords from './HighlightFilteredWords';
import useUserRecords from '../hooks/useUserRecords';

export default function RecordsDisplay({ handleLogout }) {
    const [currentDayIndex, setCurrentDayIndex] = useState(0);
    const user = useSelector(state => state.user);
    const { data: records, error, isError, isLoading } = useUserRecords(user);
    const dispatch = useDispatch();
    const filter = useSelector(state => state.filter);

    if (isError) {
        if (error.response.status === 401) {
            handleLogout();
            dispatch(setNotification('Your session has expired. Please log in again.', 10));
        }
    }

    const formatDate = (date) => {
        const options = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        };
        const formattedDate = new Intl.DateTimeFormat('en-US', options).format(new Date(date));
        const [hour, minute, period] = formattedDate.split(/[:\s]/);
        return `${parseInt(hour, 10)}:${minute} ${period}`;
    }

    const formatDay = (date) => {
        const options = {
            // year: 'numeric',
            month: 'long',
            day: 'numeric',
        };
        return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
    }

    // groupByDate takes an array of records and returns an object
    // where each key is a formatted day (YYYY Month DD) and its value is an array of records for that day
    const groupByDate = (ungroupedRecords) => {
        if (!ungroupedRecords) return {};
        const groupedRecords = ungroupedRecords
            .filter((record) => record.record.toLowerCase().includes(filter.toLowerCase()))
            .reduce((acc, record) => {
                // Format the date to only show the year, month, and day
                const day = formatDay(record.date);
                // If the day is not already in the accumulator object, create an empty array for it
                if (!acc[day]) {
                    acc[day] = [];
                }
                // Add the record to the array for its corresponding day
                acc[day].push(record);
                return acc;
            }, {});

        return groupedRecords;
    }

    const generateDummyData = () => {
        const now = new Date();
        return isLoading ?
            [
                {
                    id: 'dummy-1',
                    date: now,
                    record: 'Loading...',
                },
                {
                    id: 'dummy-2',
                    date: now,
                    record: 'Loading...',
                },
                {
                    id: 'dummy-3',
                    date: now,
                    record: 'Loading...',
                },
                {
                    id: 'dummy-4',
                    date: now,
                    record: 'Loading...',
                }
            ]
            :
            [
                {
                    id: 'dummy-1',
                    date: now,
                    record: 'Welcome to Speech Analysis!',
                },
                {
                    id: 'dummy-2',
                    date: now,
                    record: 'Click the green arrow to start dictation.',
                },
            ]
    };

    const displayRecords = records && records.length > 0 ? records : generateDummyData();

    // Group records by date using the groupByDate function
    const groupedRecords = groupByDate(displayRecords);
    // Convert the groupedRecords object into an array of key-value pairs (day and records)
    const days = Object.entries(groupedRecords);

    // on load make current day the most recent day with records
    useEffect(() => {
        setCurrentDayIndex(days.length - 1);
    }, [days.length])

    // Functions to navigate between days
    const prevDay = () => {
        if (currentDayIndex > 0) {
            setCurrentDayIndex(currentDayIndex - 1);
        }
    }

    const nextDay = () => {
        if (currentDayIndex < days.length - 1) {
            setCurrentDayIndex(currentDayIndex + 1);
        }
    }

    return Object.keys(days).length > 0 ? (
        days.slice(currentDayIndex, currentDayIndex + 1).map(([day, paginatedRecords]) => (
            <div className="records-container" key={day}>
                {/* Display only the current day based on currentDayIndex */}
                <nav className="records-nav">
                    <button className="records-nav-button" type="button" onClick={prevDay} disabled={currentDayIndex === 0}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="records-nav-svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                    <h3>{day}</h3>
                    <button className="records-nav-button" type="button" onClick={nextDay} disabled={currentDayIndex === days.length - 1}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="records-nav-svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                </nav>
                <div key={day} className="records-list">
                    {paginatedRecords.map((record) => (
                        <div className="record" key={record.id}>
                            <HighlightFilteredWords filter={filter}>
                                {record.record}
                            </HighlightFilteredWords>
                            <div className="timestamp">{formatDate(record.date)}</div>
                        </div>
                    ))}
                </div>
            </div>
        ))
    ) :
        <div className="records-container">
            <h2>No records found :/</h2>
        </div>;
}

RecordsDisplay.propTypes = {
    handleLogout: PropTypes.func.isRequired,
};
