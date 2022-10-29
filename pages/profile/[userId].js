import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth, useInterviewSlot } from "../../context";
import { EditProfile, LoginAlert, ScheduledInterviewSlot } from "../../components";
import { AddInterviewSlot } from "../../components";
import { UserInterviewSlot } from "../../components";
import { ProfileCard } from "../../components";
import PrivateRoute from "../../components/PrivateRoute/PrivateRoute";
import profileStyles from "../../styles/Profile.module.css";
import { scheduledSlots } from "../../utils";
import { UsernameAlert } from "../../components/UsernameAlert/UsernameAlert";

const UserProfile = ({ slots }) => {
  const [editProfile, setEditProfile] = useState(false);
  const { authState } = useAuth();
  const { interviewSlotState, interviewSlotDispatch } = useInterviewSlot();
  const [showUsernameAlert, setShowUsernameAlert] = useState(false);


  const scheduledInterviews = scheduledSlots(
    interviewSlotState.interviewSlots,
    authState.user?._id
  );

  useEffect(() => {
    if (slots && typeof slots !== null) {
      if (typeof slots === "string") {
        interviewSlotDispatch({
          type: "SET_STATUS",
          payload: {
            status: { success: "You haven't scheduled any interview slot!" },
          },
        });
      } else {
        interviewSlotDispatch({
          type: "LOAD_USER_INTERVIEW_SLOT",
          payload: { slots },
        });
      }
    } else {
      interviewSlotDispatch({
        type: "SET_STATUS",
        payload: { status: { error: "Couldn't load user interview slot!" } },
      });
    }
  }, [slots]);

  return (
    <section style={ { margin: "0 15%" } }>
      { showUsernameAlert && <UsernameAlert setShowUsernameAlert={ setShowUsernameAlert } /> }
      <div className={ profileStyles.profile }>
        <div className={ profileStyles.profileCard }>
          { editProfile && (
            <EditProfile
              setEditProfile={ setEditProfile }
              userDetail={ authState.user }
            />
          ) }

          <ProfileCard userDetail={ authState.user } editProfile={ editProfile } setEditProfile={ setEditProfile } />
        </div>
        <div className={ profileStyles.interviewSlotForm }>
          <AddInterviewSlot setShowUsernameAlert={ setShowUsernameAlert } />
        </div>
      </div>
      <div>
        { interviewSlotState.userInterViewSlots.slots.length === 0 ? (
          <h1 className='textCenter'>You haven't added any slots yet!</h1>
        ) : (
          <UserInterviewSlot userDetail={ authState.user } />
        ) }
      </div>
      <div>
        { scheduledInterviews.length === 0 ? (
          <h1 className='textCenter'>
            Your interview slots have not matched with anyone yet!
          </h1>
        ) : (
          <ScheduledInterviewSlot />
        ) }
      </div>
    </section>
  );
};

export async function getServerSideProps(context) {
  const authToken = context.req.cookies.token;

  let userInterviewDetails = null;
  try {
    let response = await fetch(
      `${process.env.API_URL}api/interviewSlot/${context.params.userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
      }
    );
    const data = await response.json();
    if (data.statusCode === 200) {
      userInterviewDetails =
        data?.data && JSON.parse(JSON.stringify(data?.data?.slots));
    } else {
      if (data.statusCode === 202) {
        userInterviewDetails = data?.data;
      }
    }
  } catch (error) {
    console.log({ error });
  }

  return {
    props: {
      slots: userInterviewDetails,
    },
  };
}

export default PrivateRoute(UserProfile);
