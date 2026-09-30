import {useAppContext} from "~/hooks/AppContext";
import {useEffect, useState} from "react";
import Category from "~/classes/Category";
import Company from "~/classes/Company";
import {Card, GridContainer} from "~/components/Card";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCalendarAlt, faClockFour} from "@fortawesome/free-regular-svg-icons";
import Modal from "~/components/Modal";
import {SelectList} from "~/components/SelectList";
import {Helper} from "~/constant/Helper";
import Button from "~/components/Button";
import {Calendar} from "~/components/Calendar";
import Appointment from "~/classes/Appointment";
import {type GroupId, type TimeGroup, TimeSlotGroup} from "~/components/TimeSlotGroup";
import styled from "styled-components";
import {useMessenger} from "~/hooks/MessengerContext";
import type Service from "~/classes/Service";

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
    }
`

const Create = () => {
    const {setTheme, setBarVisible, setTitle, loader, setUseOpacity} = useAppContext();
    const {ready} = useMessenger()

    const [title, _setTitle] = useState("Hello")
    const [modalVisible, setModalVisible] = useState(false)
    const [buttonTitle, setButtonTitle] = useState("Выберите дату")
    const [buttonDisable, setButtonDisable] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState<Category>()
    const [selectedService, setSelectedService] = useState<Service>()
    const [activePane, setActivePane] = useState("")
    const [selectedDate, setSelectedDate] = useState<Date>()
    const [selectedTime, setSelectedTime] = useState<GroupId|undefined>()
    const [timeList, setTimeList] = useState<TimeGroup[]>([{
        id: `time-0`,
        label: "09:00-12:00",
        start: "09:00",
        end: "12:00",
    }, {
        id: `time-1`,
        label: "13:00-17:00",
        start: "13:00",
        end: "17:00",
    }])
    const [category, setCategory] = useState<Category>()
    const [company, setCompany] = useState<Company>()

    const handleConfirm = () => {
        switch (activePane) {
            case "category":
                setActivePane("service");
                setButtonTitle("Выберите услугу")
                setButtonDisable(!!selectedDate && Number.isInteger(selectedTime))
                break;
            case "service":
                setActivePane("calendar");
                setButtonTitle("Сохранить")
                setButtonDisable(!!selectedDate && Number.isInteger(selectedTime))
                break;
            case "calendar":
                const user_id = localStorage.getItem('user_id');
                const company_id = import.meta.env.VITE_COMPANY_ID;
                const timeItem = timeList.find((item) => item.id === selectedTime)?.start;
                if (user_id) {
                    if (selectedCategory && timeItem) {
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
                                console.log(response)
                            })
                            .catch(error => {
                                console.error(error)
                            })
                    }
                }
                setModalVisible(false);
                setButtonTitle("Выберите дату")
                // setButtonDisable(!!selectedTime && !!selectedDate)
                break;
        }
        if (activePane === "category") {
        } else if (activePane === "calendar") {
        }
    }
    async function clientLoader() {
        const company_id = import.meta.env.VITE_COMPANY_ID;
        const c = await Company.get(company_id)
        if (c && c.default_category_id) {
            const categories = await Category.getChildrenById(c.default_category_id);
            // @ts-ignore
            setCategory(categories)
            setCompany(c)
            return;
        }
        setCategory(undefined);
        setCompany(new Company({
            title: '',
            logo: '',
            id: 0,
            default_category_id: 0,
            branches: [],
        }))
    }

    useEffect(() => {

        clientLoader();
        return () => {};
    }, []);
    useEffect(() => {
        setBarVisible(!modalVisible)
    }, [modalVisible]);
    useEffect(() => {
        setTheme('static')
        setBarVisible(true)
        setUseOpacity(true)
        setTitle("Записаться");

        loader.showFullscreenLoader()
        loader.setShowLoader(true)
        if (category && ready) {
            loader.setShowLoader(false)
        }
    }, [category, ready]);
    useEffect(() => {
        console.log(selectedService)
    }, [selectedService]);

    return (
        <>
            <CompanyCard>
                <div className={"company-logo"}>
                    <img src={Helper.url + company?.logo} alt={company?.title} width={"15vw"} />
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
                      }} onClick={(event: any) => {
                          event.preventDefault()
                          setModalVisible(true)
                          _setTitle("Выберите категорию")
                          setActivePane("category")
                          setButtonTitle("Выберите услугу");
                      }}>
                    <span className={"icon"} style={{top: "20px", right: "30px"}}>
                        <FontAwesomeIcon icon={faCalendarAlt} size={"2x"}/>
                    </span>
                    <h3 style={{textAlign: "left"}}>Выберите<br/>услугу</h3>
                    <p>{selectedService?.title ?? ""}</p>
                </Card>
                <Card to={"#"} className={"single"} style={{
                    justifyItems: "left",
                    justifyContent: "space-between",
                    display: "flex",
                    flexDirection: "column"
                }} onClick={(event: any) => {
                    event.preventDefault()
                    setModalVisible(true)
                    _setTitle("Выберите Дату")
                    setActivePane("calendar")
                    setButtonTitle("Сохранить")
                    setButtonDisable(!!selectedDate && Number.isInteger(selectedTime))
                }}>
                    <span className={"icon"} style={{top: "20px", right: "30px"}}>
                        <FontAwesomeIcon icon={faClockFour} size={"2x"}/>
                    </span>
                    <h3 style={{textAlign: "left"}}>Выберите время</h3>
                    <p>{timeList?.find((item) => item.id === selectedTime)?.label ?? ""}</p>
                </Card>
            </GridContainer>
            <Modal $useClose={true} $visible={modalVisible} $title={title} $onClose={() => {
                setModalVisible(false)
            }}>
                {activePane === "category" &&
                    <div className={"category"} style={{height: "calc(100vh - 10rem)", overflowY: "auto"}}>
                        <SelectList list={category?.children ?? []} name={"category"} value={selectedCategory?.id ?? null}
                                    onChange={(event) => {
                                        const categoryId = Number(event.target.getAttribute("value"));
                                        setSelectedCategory(Helper.findById(category?.children ?? [], categoryId))
                                        setButtonDisable(false)
                                    }} style={{height: '75vh', overflowY: "auto"}}/>
                    </div>}
                {activePane === "service" &&
                    <div>
                        <SelectList list={selectedCategory?.services ?? []} name={"service"} value={selectedService?.id ?? null}
                                    onChange={(event) => {
                                        const serviceId = Number(event.target.getAttribute("value"));
                                        setSelectedService(Helper.findById(selectedCategory?.services ?? [], serviceId))
                                        setButtonDisable(false)
                                    }} style={{height: '75vh', overflowY: "auto"}}/>
                    </div>
                }
                {activePane === "calendar" &&
                    <div className={"calendar"} style={{height: "calc(100vh - 10rem)", overflowY: "auto"}}>
                        <div style={{marginBottom: "10px"}}>
                            <Calendar selectedDate={selectedDate ?? new Date()} onChange={(date) => {
                                setSelectedDate(date);
                                setButtonDisable(!!selectedDate && Number.isInteger(selectedTime));
                                setSelectedTime(undefined);
                            }}/>
                        </div>
                        <TimeSlotGroup selectedTimeSlot={""} selectedGroupId={selectedTime?.toString()}
                                       blockedTimeSlots={[]} groupOnlyMode={true} showGroupStats={false}
                                       timeGroups={timeList}
                                       onGroupSelect={(groupId) => {
                                           setSelectedTime(timeList.find((item) => item.id === groupId)?.id)
                                           setButtonDisable(!!selectedDate && Number.isInteger(selectedTime))
                                       }} onChange={function (slot: string | null): void {
                        }}/>
                    </div>
                }
                <Modal.Control>
                    <Button disabled={buttonDisable} onClick={handleConfirm}
                            $variant={"secondary"}>{buttonTitle}</Button>
                </Modal.Control>
            </Modal>
        </>
    );
};

export default Create;