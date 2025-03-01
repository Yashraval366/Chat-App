import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchUsers, validUser } from "../apis/auth";
import { setActiveUser } from "../redux/activeUserSlice";
import { BsSearch } from "react-icons/bs";
import { BiNotification } from "react-icons/bi";
import { IoIosArrowDown } from "react-icons/io";
import { setShowNotifications, setShowProfile } from "../redux/profileSlice";
import Chat from "./Chat";
import Profile from "../components/Profile";
import { acessCreate } from "../apis/chat.js";
import "./home.css";
import { fetchChats, setNotifications } from "../redux/chatsSlice";
import { getSender } from "../utils/logics";
import { setActiveChat } from "../redux/chatsSlice";
import Group from "../components/Group";
import Contacts from "../components/Contacts";
import Search from "../components/group/Search";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Home() {
  const dispatch = useDispatch();
  const { showProfile, showNotifications } = useSelector((state) => state.profile);
  const { notifications } = useSelector((state) => state.chats);
  const activeUser = useSelector((state) => state.activeUser);

  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleClick = async (e) => {
    try {
      await acessCreate({ userId: e._id });
      dispatch(fetchChats());
      setSearch("");
    } catch (error) {
      console.error("Error accessing chat:", error);
    }
  };

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    const searchChange = async () => {
      setIsLoading(true);
      try {
        const { data } = await searchUsers(search);
        setSearchResults(data);
      } catch (error) {
        console.error("Search Error:", error);
      }
      setIsLoading(false);
    };

    searchChange();
  }, [search]);

  const isValid = useCallback(async () => {
    try {
      const data = await validUser();
      if (data?.user) {
        dispatch(
          setActiveUser({
            id: data.user._id,
            email: data.user.email,
            profilePic: data.user.profilePic,
            bio: data.user.bio,
            name: data.user.name,
          })
        );
      }
    } catch (error) {
      console.error("User validation failed:", error);
    }
  }, [dispatch]);

  useEffect(() => {
    isValid();
  }, [isValid]);

  useEffect(() => {
    notifications.forEach((notification) => {
      toast.info(
        notification.chatId.isGroup
          ? `New Message in ${notification.chatId.chatName}`
          : `New Message from ${getSender(activeUser, notification.chatId.users)}`
      );
    });
  }, [notifications, activeUser]);

  return (
    <div className="bg-[#282C35!] scrollbar-hide z-10 h-[100vh] lg:w-[90%] lg:mx-auto overflow-y-hidden shadow-2xl">
      <div className="flex">
        {!showProfile ? (
          <div className="md:flex md:flex-col min-w-[360px] h-[100vh] md:h-[98.6vh] bg-[#ffff] relative">
            <div className="h-[61px] px-4">
              <div className="flex">
                <a className="flex items-center relative -top-4 block h-[90px]" href="/">
                  <h3 className="text-[20px] text-[#1f2228] font-body font-extrabold tracking-wider">
                    Messages
                  </h3>
                </a>
              </div>
              <div className="absolute top-4 right-5 flex items-center gap-x-3">
                <button onClick={() => dispatch(setShowNotifications(!showNotifications))}>
                  <BiNotification style={{ color: "#319268", width: "25px", height: "25px" }} />
                </button>
                <button onClick={() => dispatch(setShowProfile(true))} className="flex items-center gap-x-1 relative">
                  <img className="w-[28px] h-[28px] rounded-[25px]" src={activeUser?.profilePic} alt="" />
                  <IoIosArrowDown style={{ color: "#616c76", height: "14px", width: "14px" }} />
                </button>
              </div>
            </div>

            <div>
              <div className="-mt-6 relative pt-6 px-4">
                <form onSubmit={(e) => e.preventDefault()}>
                  <input
                    onChange={handleSearch}
                    className="w-[99.5%] bg-[#f6f6f6] text-[#111b21] tracking-wider pl-9 py-[8px] rounded-[9px] outline-0"
                    type="text"
                    name="search"
                    placeholder="Search"
                  />
                </form>
                <div className="absolute top-[36px] left-[27px]">
                  <BsSearch style={{ color: "#c4c4c5" }} />
                </div>
                <Group />
                {search && (
                  <div className="h-[100vh] absolute z-10 w-[100%] left-[0px] top-[70px] bg-[#fff] flex flex-col gap-y-3 pt-3 px-4">
                    <Search searchResults={searchResults} isLoading={isLoading} handleClick={handleClick} search={search} />
                  </div>
                )}
              </div>
              <Contacts />
            </div>
          </div>
        ) : (
          <Profile className="min-w-[100%] sm:min-w-[360px] h-[100vh] bg-[#fafafa] shadow-xl relative" />
        )}
        <Chat className="chat-page relative lg:w-[100%] h-[100vh] bg-[#fafafa]" />
      </div>

      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Home;
