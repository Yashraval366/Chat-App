import React from 'react';
import { useSelector } from 'react-redux';
import ScrollableFeed from "react-scrollable-feed";
import { isSameSender, isSameSenderMargin, isSameUser, isLastMessage } from '../utils/logics';
import { Tooltip } from "react-tooltip"; // ✅ Updated Tooltip
import Avatar from "react-avatar"; // ✅ Replaced Chakra UI Avatar
import "../pages/home.css";

function MessageHistory({ messages }) {
  const activeUser = useSelector((state) => state.activeUser);

  return (
    <ScrollableFeed className='scrollbar-hide'>
      {messages &&
        messages.map((m, i) => (
          <div className='flex items-center gap-x-[6px]' key={m._id}>
            {(isSameSender(messages, m, i, activeUser.id) ||
              isLastMessage(messages, i, activeUser.id)) && (
              <>
                <Avatar
                  name={m.sender?.name}
                  src={m.sender?.profilePic}
                  size="32"
                  round={true}
                  style={{ marginTop: "43px", cursor: "pointer" }}
                  data-tooltip-id={`tooltip-${m._id}`} // ✅ React-Tooltip support
                />
                <Tooltip id={`tooltip-${m._id}`} place="bottom-start">
                  {m.sender?.name}
                </Tooltip>
              </>
            )}
            <span
              className='tracking-wider text-[15px] font-medium'
              style={
                {
                  backgroundColor: `${m.sender._id === activeUser.id ? "#268d61" : "#f0f0f0"}`,
                  marginLeft: isSameSenderMargin(messages, m, i, activeUser.id),
                  marginTop: isSameUser(messages, m, i, activeUser.id) ? 3 : 10,
                  borderRadius: `${m.sender._id === activeUser.id ? "10px 10px 0px 10px" : "10px 10px 10px 0"}`,
                  padding: "10px 18px",
                  maxWidth: "460px",
                  color: `${m.sender._id === activeUser.id ? "#ffff" : "#848587"}`,
                }
              }
            >
              {m.message}
            </span>
          </div>
        ))}
    </ScrollableFeed>
  );
}

export default MessageHistory;
