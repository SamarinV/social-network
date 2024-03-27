import EditIcon from "@mui/icons-material/Edit"
import { CircularProgress, IconButton, Tooltip } from "@mui/material"
import { styled } from "@mui/material/styles"
import { AppRootStateType } from "app/store"
import DefaultAvatar from "common/assets/defaultAvatar.png"
import Block from "common/components/Block/Block"
import Posts from "common/components/Posts/Posts"
import { useAppDispatch } from "common/hooks/useAppDispatch"
import React, { useEffect } from "react"
import { useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import { profileThunks } from "../model/profile.slice"
import s from "./Profile.module.css"
import Status from "./Status"
import LinearLoader from "common/components/LinearLoader/LinearLoader"
import BorderLoader from "common/components/BorderLoader/BorderLoader"
import ModalApp from "common/components/ModalApp/ModalApp"
import { useState } from "react"

const ProfilePage = () => {
  const user = useSelector((store: AppRootStateType) => store.profile.user)
  const photoIsLoading = useSelector((store: AppRootStateType) => store.profile.photoIsLoading)
  const authUserId = useSelector((store: AppRootStateType) => store.auth.userData.id)
  const [isOpenModal, setIsOpenModal] = useState(false)
  const dispatch = useAppDispatch()
  const { id } = useParams()

  const isMyProfile = authUserId == Number(id) ? true : false
  console.log("prpfile")
  useEffect(() => {
    dispatch(profileThunks.setProfile(Number(id)))
    dispatch(profileThunks.getStatus(Number(id)))
  }, [id])

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      dispatch(profileThunks.savePhoto(e.target.files[0]))
      // .then(() => {
      //   dispatch(profileThunks.setProfile(Number(user?.userId)))
      // })
    }
  }

  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  })

  if (!user) {
    return <></>
  }

  const contactsWithValue = Object.entries(user.contacts).filter((el) => {
    return el[1] !== null && el[1] !== ""
  })

  const contacts = contactsWithValue.map((el, index) => {
    return (
      <div key={index}>
        {el[0]}:{" "}
        <a className={s.link} href={`${el[1]}`}>
          {el[1]}
        </a>
      </div>
    )
  })

  const openPhotoHandler = (photoUrl: string) => {
    if (photoUrl) {
      setIsOpenModal(true)
    }
  }

  return (
    <div className={s.wrapper}>
      <Block withImage={true}>
        <div className={s.profileWrapper}>
          <div className={s.userPhotoWrapper}>
            <BorderLoader loaderIsVisable={photoIsLoading}>
              <img
                className={`${s.img} ${s.imgIsloading}`}
                src={user.photos.large ? `${user.photos.large}` : `${DefaultAvatar}`}
                alt="Фото пользователя"
                onClick={() => openPhotoHandler(user.photos.large)}
              />
            </BorderLoader>

            {isMyProfile && !photoIsLoading && (
              <Tooltip title="Загрузить новое фото" placement="top">
                <IconButton
                  sx={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    opacity: "0",
                    transition: "0.6s",
                    pading: "30px",
                    border: "1px solid blue",
                  }}
                  aria-label="edit"
                  color="primary"
                  component="label"
                >
                  <EditIcon />
                  <VisuallyHiddenInput type="file" accept="image/*" onChange={onImageChange} />
                </IconButton>
              </Tooltip>
            )}
          </div>

          <div className={s.person}>
            <div className={s.fullName}>{user.fullName}</div>
            <div>
              <Status />
            </div>
            <div>Ищу работу: {user.lookingForAJob ? "да" : "нет"}</div>
            <div>
              Интересуемая вакансия:{" "}
              {user.lookingForAJobDescription === "" ? `${user.lookingForAJobDescription}` : "не указано"}
            </div>

            <div className={s.contacts}>Контакты: </div>
            {contactsWithValue.length ? contacts : <span>Контакты не указаны</span>}
          </div>
        </div>
      </Block>
      <Posts />

      <ModalApp isOpenModal={isOpenModal} setIsOpenModal={setIsOpenModal} photoUrl={user.photos.large} />
    </div>
  )
}

export default React.memo(ProfilePage)