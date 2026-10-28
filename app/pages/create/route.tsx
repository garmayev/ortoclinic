import {useAppContext} from "~/hooks/AppContext";
import {useEffect, useState} from "react";
import Category from "~/classes/Category";
import Company from "~/classes/Company";
import {Card, GridContainer} from "~/components/Card";
import Modal from "~/components/Modal";
import {SelectList} from "~/components/SelectList";
import {Helper} from "~/constant/Helper";
import Button from "~/components/Button";
import {Calendar} from "~/components/Calendar";
import Appointment from "~/classes/Appointment";
import {type GroupId, type TimeGroup, TimeSlotGroup} from "~/components/TimeSlotGroup";
import {styled} from "styled-components";
import {useMessenger} from "~/hooks/MessengerContext";
import Service from "~/classes/Service";
import Alert from "~/components/Alert";
import {useNavigate} from "react-router";
import taskList from "~/assets/task-list.png";
import deadLine from "~/assets/deadline.png";

const CompanyCard = styled.div`
    display: flex;
    flex-direction: row;
    width: calc(100% - 2rem);
    color: var(--secondary-color);
    
    & > .company-logo {
        width: 15vw;
        & > img {
            width: 15vw;
            height: 15vw;
            border-radius: 50%;
            object-fit: cover;
        }
    }
    & > .company-info {
        display: flex;
        flex-direction: column;
        padding-left: 1rem;
        & > .company-type {
            font-family: "TildaSansLight";
        }
    }
`

const Create = () => {
    const {setTheme, setBarVisible, setTitle, loader, setUseOpacity} = useAppContext();
    const {ready, isRegistered} = useMessenger()
    const navigate = useNavigate();

    const date = new Date(); // Current date
    const currentDate = new Date(date.setDate(date.getDate() + 1)); 

    const [title, _setTitle] = useState("Hello")
    const [modalVisible, setModalVisible] = useState(false)
    const [buttonTitle, setButtonTitle] = useState("Выберите дату")
    const [buttonDisable, setButtonDisable] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState<Category>()
    const [selectedService, setSelectedService] = useState<Service|null>()
    const [activePane, setActivePane] = useState("")
    const [selectedDate, setSelectedDate] = useState<Date|null>(currentDate)
    const [selectedTime, setSelectedTime] = useState<GroupId|null>()
    const [message, _setMessage] = useState<string>("")
    const [timeList, setTimeList] = useState<TimeGroup[]>([])
    const [category, setCategory] = useState<Category>()
    const [company, setCompany] = useState<Company>()
    const [loadError, setLoadError] = useState("")
    const [attempt, setAttempt] = useState(0)
    const [backButtonDisable, setBackButtonDisable] = useState<boolean>(true);

    const setMessage = (message: string) => {
        if (message) {
            setBarVisible(false)
            _setMessage(message)
            setTimeout(() => {
                _setMessage("")
                setBarVisible(true)
                navigate("/home", {viewTransition: true})
            }, 3000)
        }
    }
    
    const handleBack = () => {
        switch (activePane) {
            case "category":
                break;
            case "service":
                setActivePane("category")
                setBackButtonDisable(true)
                setButtonDisable(!selectedCategory)
                setButtonTitle("Выберите услугу")
                break;
            case "calendar":
                setActivePane("service")
                setBackButtonDisable(false)
                setButtonDisable(!selectedService)
                setButtonTitle("Выберите дату и время")
                break;
        }
    }

    const handleConfirm = () => {
        switch (activePane) {
            case "category":
                setActivePane("service");
                setButtonTitle("Выберите дату и время")
                setButtonDisable(!selectedService)
                setBackButtonDisable(false)
                _setTitle("Выберите услугу")
                break;
            case "service":
                setActivePane("calendar");
                setButtonTitle("Сохранить")
                setButtonDisable(!selectedTime)
                setBackButtonDisable(false)
                _setTitle("Выберите дату и время")
                break;
            case "calendar":
                const user_id = localStorage.getItem('user_id');
                const company_id = import.meta.env.VITE_COMPANY_ID;
                const timeItem = timeList.find((item) => item.id === selectedTime)?.start;
                if (user_id) {
                    if (selectedCategory && timeItem) {
                        loader.setShowLoader(true)
                        Appointment.create({
                            date: Helper.dateFormat(selectedDate ?? new Date(), "YYYY-MM-DD"),
                            start: timeItem,
                            status: 0,
                            source: "max",
                            client_id: Number(user_id),
                            company_id: company_id,
                            branch_id: 1,
                            services: selectedService ? [Number(selectedService.id)] : undefined
                        })
                            .then(response => {
                                if (response) {
                                    setMessage("Запись успешно создана")
                                }
                            })
                            .catch(error => {
                                console.error(error)
                            })
                            .finally(() => {
                                loader.setShowLoader(false)
                            })
                    }
                }
                setModalVisible(false);
                setButtonTitle("Выберите дату")
                setBackButtonDisable(false)
                // setButtonDisable(!!selectedTime && !!selectedDate)
                break;
        }
    }

    async function clientLoader(isActive = () => true) {
        const company_id = import.meta.env.VITE_COMPANY_ID;
        const c = await Company.get(company_id)
        if (c && c.default_category_id) {
            const categories = await Category.getChildrenById(c.default_category_id);
            if (!isActive()) return;
            // @ts-ignore
            setCategory(categories)
            setCompany(c)
            return;
        }
        throw new Error("В клинике не настроены направления записи");
    }

    useEffect(() => {
        if (!ready || !isRegistered) return;
        let active = true;
        setLoadError("");
        loader.showFullscreenLoader();
        clientLoader(() => active).catch(() => {
            if (active) setLoadError("Не удалось загрузить услуги для записи. Проверьте соединение и повторите попытку.");
        }).finally(() => {
            if (active) loader.hideLoader();
        });
        return () => { active = false; loader.hideLoader(); };
    }, [ready, isRegistered, attempt]);
    useEffect(() => {
        setBarVisible(!modalVisible)
    }, [modalVisible]);
    useEffect(() => {
        setTheme('static')
        setBarVisible(true)
        setUseOpacity(true)
        setTitle("Записаться");

        if (ready && category) {
            const c = localStorage.getItem("selected_category");
            const s = localStorage.getItem("selected_service");

            if (c && s) {
                localStorage.removeItem("selected_category")
                localStorage.removeItem("selected_service")
                const cat = Helper.findById(category?.children ?? [], Number(c));
                const ser = Helper.findById(cat?.services ?? [], Number(s));
                setSelectedCategory(cat)
                setSelectedService(ser)
                setActivePane("calendar")
                setButtonTitle("Сохранить")
                setButtonDisable(true)
                setBackButtonDisable(false)
                setModalVisible(true)
                setBarVisible(false)
                _setTitle("Выберите Дату");
            }
        }
    }, [category, ready]);
    
    useEffect(() => {
        const currentSchedule = selectedService?.getSchedule(selectedDate ?? currentDate);
        if (currentSchedule?.is_working) {
            if (currentSchedule?.break_start && currentSchedule?.break_end) {
                setTimeList([{
                    id: `time-0`,
                    label: `${Helper.toHoursMinutes(currentSchedule.start_time)}-${Helper.toHoursMinutes(currentSchedule.break_start)}`,
                    start: `${Helper.toHoursMinutes(currentSchedule.start_time)}`,
                    end: `${Helper.toHoursMinutes(currentSchedule.break_start)}`,
                }, {
                    id: `time-1`,
                    label: `${Helper.toHoursMinutes(currentSchedule.break_end)}-${Helper.toHoursMinutes(currentSchedule.end_time)}`,
                    start: `${Helper.toHoursMinutes(currentSchedule.break_end)}`,
                    end: `${Helper.toHoursMinutes(currentSchedule.end_time)}`,
                }])
            } else {
                setTimeList([{
                    id: `time-0`,
                    label: `${Helper.toHoursMinutes(currentSchedule.start_time)}-${Helper.toHoursMinutes(currentSchedule.end_time)}`,
                    start: `${Helper.toHoursMinutes(currentSchedule.start_time)}`,
                    end: `${Helper.toHoursMinutes(currentSchedule.end_time)}`,
                }])
            }
        } else {
            setTimeList([]);
        }
    }, [selectedCategory, selectedDate])
    useEffect(() => {
        if (selectedDate === null) {
            setSelectedDate(currentDate);
        }
    }, [selectedDate, currentDate])

    return (
        <>
            {loadError && <div role="alert"><p>{loadError}</p><Button $variant="secondary" onClick={() => setAttempt(value => value + 1)}>Повторить</Button></div>}
            {message && <Alert $message={message}/>}
            <CompanyCard>
                <div className={"company-logo"}>
                    <img src={company?.logo ? Helper.url + company?.logo : ""} alt={company?.title} width={"15vw"} />
                </div>
                <div className={"company-info"}>
                    <span className={"company-title"}>{company?.title}</span>
                    <span className={"company-type"}>{company?.type}</span>
                </div>
            </CompanyCard>
            <GridContainer style={{width: "100%"}}>
                <Card to={"#"} className={"single"}
                      style={{
                          justifyItems: "left",
                          justifyContent: "space-between",
                          display: "flex",
                          flexDirection: "column"
                      }} onClick={(event) => {
                          event.preventDefault()
                          setModalVisible(true)
                          _setTitle("Выберите категорию")
                          setActivePane("category")
                          setButtonTitle("Выберите услугу");
                          setButtonDisable(!selectedCategory);
                      }}>
                    <span className={"icon"} style={{top: "15px", right: "15px"}}>
                        <img src={taskList} style={{width: "30px"}} />
                    </span>
                    <h3 style={{textAlign: "left", fontWeight: 100}}>Выберите<br/>услугу</h3>
                    <p>{selectedService?.title ?? ""}</p>
                </Card>
                <Card to={"#"} className={"single"} style={{
                    justifyItems: "left",
                    justifyContent: "space-between",
                    display: "flex",
                    flexDirection: "column"
                }} onClick={(event) => {
                    event.preventDefault()
                    setModalVisible(true)
                    _setTitle("Выберите Дату")
                    setActivePane("calendar")
                    setButtonTitle("Сохранить")
                    setButtonDisable(!selectedTime)
                }}>
                    <span className={"icon"} style={{top: "15px", right: "15px"}}>
                        <img src={deadLine} style={{width: "30px"}} />
                    </span>
                    <h3 style={{textAlign: "left", fontWeight: 100}}>Выберите время<br />и дату</h3>
                    <p>{timeList?.find((item) => item.id === selectedTime)?.label ?? ""}</p>
                </Card>
            </GridContainer>
            <Modal $useClose={true} $visible={modalVisible} $title={title} $onClose={() => {
                setModalVisible(false)
            }}>
                {activePane === "category" &&
                    <div className={"category"} style={{height: "calc(100vh - 15rem)", overflowY: "auto"}}>
                        <SelectList list={category?.children ?? []} name={"category"} value={selectedCategory?.id ?? null}
                                    onChange={(event) => {
                                        const categoryId = Number(event.target.getAttribute("value"));
                                        setSelectedCategory(Helper.findById(category?.children ?? [], categoryId))
                                        setSelectedService(null)
                                        setSelectedDate(new Date())
                                        setSelectedTime(null)
                                        setButtonDisable(false)
                                    }} style={{height: '75vh', overflowY: "auto"}}/>
                    </div>}
                {activePane === "service" &&
                    <div className={"service"} style={{height: "calc(100vh - 15rem)", overflowY: "auto"}}>
                        <SelectList list={selectedCategory?.services.filter((item: Service) => item.status === 1) ?? []} name={"service"} value={selectedService?.id ?? null}
                                    onChange={(event) => {
                                        const serviceId = Number(event.target.getAttribute("value"));
                                        setSelectedService(Helper.findById(selectedCategory?.services ?? [], serviceId))
                                        setButtonDisable(false)
                                        setSelectedDate(new Date())
                                        setSelectedTime(null)
                                    }} style={{height: '75vh', overflowY: "auto"}}/>
                    </div>
                }
                {activePane === "calendar" &&
                    <div className={"calendar"} style={{height: "calc(100vh - 15rem)", overflowY: "auto"}}>
                        <div>
                            <Calendar selectedDate={selectedDate ?? currentDate} onChange={(date) => {
                                setSelectedDate(date);
                                setButtonDisable(true);
                                setSelectedTime(null);
                            }} />
                            <p style={{background: "#FFF", margin: "10px 0", padding: "10px", fontFamily: "Tenor Sans", borderRadius: "var(--border-radius)", textAlign: "center"}}>Выберите удобный для вас диапазон времени, а мы внесём вас в наше расписание</p>
                        </div>
                        <TimeSlotGroup selectedTimeSlot={""} selectedGroupId={selectedTime?.toString()}
                                       blockedTimeSlots={[]} groupOnlyMode={true} showGroupStats={false}
                                       timeGroups={timeList}
                                       onGroupSelect={(groupId) => {
                                           setSelectedTime(timeList.find((item) => item.id === groupId)?.id)
                                           setButtonDisable(!!selectedDate && Number.isInteger(selectedTime))
                                       }} onChange={function (slot: string | null): void {
                                           console.log(slot);
                        }}/>
                    </div>
                }
                <Modal.Control>
                    <Button disabled={buttonDisable} onClick={handleConfirm}
                            $variant={"secondary"} style={{height: 60, borderRadius: 30}}>{buttonTitle}</Button>
                    <Button disabled={backButtonDisable} onClick={handleBack}
                            $variant={"secondary"} style={{height: 60, borderRadius: 30}}>Назад</Button>
                </Modal.Control>
            </Modal>
        </>
    );
};

export default Create;
