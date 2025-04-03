// components/RequestCard.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const RequestCard = ({ request }) => {
  const navigate = useNavigate();

  // Check if this is an external support ticket
  const isExternalTicket = request.request_metadata?.ticket_type === 'external_support';

  // Format the time since creation
  const timeAgo = formatDistanceToNow(new Date(request.created_at), { addSuffix: true });

  // Get external ticket info if available
  const externalSource = isExternalTicket ? request.request_metadata.source : null;
  const externalEmail = isExternalTicket ? request.request_metadata.email : null;

  // Handle click to view request details
  const handleClick = () => {
    navigate(`/requests/${request.id}`);
  };

  return (
    <div
      className={`request-card ${isExternalTicket ? 'external-ticket' : ''}`}
      onClick={handleClick}
    >
      <div className="request-header">
        <h3 className="request-title">{request.title}</h3>
        {isExternalTicket && (
          <span className="external-badge">
            External - {externalSource || 'Unknown Source'}
          </span>
        )}
      </div>

      <div className="request-meta">
        <span className="request-email">
          {isExternalTicket ? externalEmail : request.user?.email || 'Unknown user'}
        </span>
        <span className="request-time">{timeAgo}</span>
      </div>

      <div className="request-content">
        <p>{request.content.substring(0, 150)}...</p>
      </div>

      <div className="request-footer">
        <span className={`status-badge ${request.status}`}>
          {request.status}
        </span>

        {isExternalTicket && request.request_metadata.website_id && (
          <span className="website-id">
            Site ID: {request.request_metadata.website_id}
          </span>
        )}
      </div>

      <style jsx>{`
        .request-card {
          background-color: #fff;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .request-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .external-ticket {
          border-left: 4px solid #6366f1;
        }
        
        .request-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        
        .request-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .external-badge {
          font-size: 12px;
          padding: 4px 8px;
          background-color: #6366f1;
          color: white;
          border-radius: 4px;
          font-weight: 500;
        }
        
        .request-meta {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: #64748b;
          margin-bottom: 12px;
        }
        
        .request-content {
          color: #334155;
          font-size: 15px;
          line-height: 1.5;
          margin-bottom: 12px;
        }
        
        .request-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .status-badge {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 500;
          text-transform: capitalize;
        }
        
        .open {
          background-color: #fbbf24;
          color: #7c2d12;
        }
        
        .in_progress {
          background-color: #60a5fa;
          color: #1e3a8a;
        }
        
        .completed {
          background-color: #34d399;
          color: #064e3b;
        }
        
        .cancelled {
          background-color: #9ca3af;
          color: #1f2937;
        }
        
        .website-id {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default RequestCard;