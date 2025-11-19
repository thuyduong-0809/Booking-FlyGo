'use client';

import React, { useEffect, useState } from 'react';
import {
  RocketLaunchIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { Aircraft, Maintenance, Seat, Airline } from '../../types/database';
import { requestApi } from '@/lib/api';
import { useNotification } from '../Notification';



interface ExtendedSeat extends Seat {
  aircraftName: string;
}

interface ExtendedMaintenance extends Maintenance {
  aircraftName: string;
  technician: string;
  duration: number;
}

interface AircraftManagementProps {
  activeSubTab?: string;
}

export default function AircraftManagement({ activeSubTab = 'aircraft' }: AircraftManagementProps) {
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [AircraftsList, setAircraftsList] = useState([]);
  const [aircraftCode, setAircraftCode] = useState('');
  const [model, setModel] = useState('');
  const [airlineId, setAirlineId] = useState<number | null>(null);

  const [economyCapacity, setEconomyCapacity] = useState<number | null>(null);
  const [businessCapacity, setBusinessCapacity] = useState<number | null>(null);
  const [firstClassCapacity, setFirstClassCapacity] = useState<number | null>(null);

  const [seatLayoutJSON, setSeatLayoutJSON] = useState({
    layout: {
      Economy: '',
      Business: '',
      First: ''
    },
    hasWiFi: false,
    hasPremiumEntertainment: false
  });

  const [lastMaintenance, setLastMaintenance] = useState("");
  const [nextMaintenance, setNextMaintenance] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<any>({});
  const [updateErrors, setUpdateErrors] = useState<any>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [aircraftUpdateData, setAircraftUpdateData] = useState({
    aircraftCode: "",
    model: "",
    economyCapacity: 0,
    businessCapacity: 0,
    firstClassCapacity: 0,
    seatLayoutJSON: {
      layout: { Economy: "", Business: "", First: "" },
      hasWiFi: false,
      hasPremiumEntertainment: false,
    },
    lastMaintenance: "",
    nextMaintenance: "",
    isActive: true,
  });

  const [airlines, setAirlines] = useState([])
  const [seats, setSeats] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // bật loading trước
      await Promise.all([
        loadAircrafts(),
        loadAirlines(),
      ]);
      setLoading(false); // tắt loading sau khi load xong
    };

    fetchData();
  }, []);

  const loadAircrafts = async () => {
    await requestApi("aircrafts", "GET").then((res: any) => {
      if (res.success) {
        setAircraftsList(res.data)
      }
    }).catch((error: any) => {
      console.error(error)
    });
  }

  const loadAirlines = async () => {
    await requestApi("airlines", "GET").then((res: any) => {
      if (res.success) {
        setAirlines(res.data)
      }
    }).catch((error: any) => {
      console.error(error)
    });
  }

  // Layout mặc định cho từng hạng
  const defaultLayouts = {
    First: '1-2-1',      // First Class: 1-2-1 (mặc định)
    Business: '2-2-2',   // Business: 2-2-2 (mặc định)
    Economy: '3-3-3',    // Economy: 3-3-3 (mặc định)
  };

  // Danh sách layout phổ biến cho mỗi hạng
  const layoutOptions = {
    First: [
      { value: '', label: 'Không có hạng First' },
      { value: '1-2-1', label: '1-2-1 (4 ghế/hàng) - Mặc định' },
      { value: '2-2-2', label: '2-2-2 (6 ghế/hàng)' },
      { value: '2-2', label: '2-2 (4 ghế/hàng)' },
      { value: 'custom', label: 'Tùy chỉnh...' },
    ],
    Business: [
      { value: '', label: 'Không có hạng Business' },
      { value: '2-2-2', label: '2-2-2 (6 ghế/hàng) - Mặc định' },
      { value: '2-4-2', label: '2-4-2 (8 ghế/hàng)' },
      { value: '2-3-2', label: '2-3-2 (7 ghế/hàng)' },
      { value: '3-3', label: '3-3 (6 ghế/hàng)' },
      { value: 'custom', label: 'Tùy chỉnh...' },
    ],
    Economy: [
      { value: '', label: 'Chọn layout' },
      { value: '3-3-3', label: '3-3-3 (9 ghế/hàng) - Mặc định' },
      { value: '3-3', label: '3-3 (6 ghế/hàng)' },
      { value: '2-4-2', label: '2-4-2 (8 ghế/hàng)' },
      { value: '2-3-2', label: '2-3-2 (7 ghế/hàng)' },
      { value: 'custom', label: 'Tùy chỉnh...' },
    ],
  };

  const [selectAircraftId, setSelectAircraftId] = useState(0)
  const [selectedAircraft, setSelectedAircraft] = useState<any>(null)
  const loadSeatsByAircraftId = async (aircraftId: number) => {
    // Lưu thông tin aircraft đã chọn
    const aircraft: any = AircraftsList.find((a: any) => a.aircraftId === Number(aircraftId));
    if (aircraft) {
      setSelectedAircraft(aircraft);
    }

    await requestApi(`seats/aircraft/${String(aircraftId)}`, "GET").then((res: any) => {
      if (res.success) {
        setSeats(res.data)
      } else {
        setSeats([])
      }
    }).catch((error: any) => {
      console.error(error)
    });
  }

  // Parse layout string thành mảng số (ví dụ: "3-3-3" -> [3, 3, 3])
  const parseLayout = (layoutString: string): number[] => {
    if (!layoutString || layoutString === '' || layoutString === 'custom') {
      return [];
    }
    return layoutString.split('-').map(Number);
  }

  // Sắp xếp ghế theo hàng và cột
  const sortSeatsByRow = (seats: any[]): any[] => {
    return [...seats].sort((a, b) => {
      // Extract row number và column letter từ seatNumber (ví dụ: "1A" -> row: 1, col: "A")
      const matchA = a.seatNumber?.match(/^(\d+)([A-Z]+)$/);
      const matchB = b.seatNumber?.match(/^(\d+)([A-Z]+)$/);

      if (!matchA || !matchB) return 0;

      const rowA = parseInt(matchA[1]);
      const rowB = parseInt(matchB[1]);

      if (rowA !== rowB) {
        return rowA - rowB;
      }

      // Nếu cùng hàng, sắp xếp theo cột
      return matchA[2].localeCompare(matchB[2]);
    });
  }

  // Map chữ cái vào vị trí trong layout
  const getSeatPositionInLayout = (seatLetter: string, layout: number[]): { section: number; position: number } | null => {
    const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];
    const letterIndex = seatLetters.indexOf(seatLetter);

    if (letterIndex === -1) return null;

    let currentPos = 0;
    for (let sectionIndex = 0; sectionIndex < layout.length; sectionIndex++) {
      const sectionSize = layout[sectionIndex];
      if (letterIndex < currentPos + sectionSize) {
        return {
          section: sectionIndex,
          position: letterIndex - currentPos
        };
      }
      currentPos += sectionSize;
    }

    return null;
  }

  // Render toàn bộ sơ đồ ghế theo từng hàng và nằm trọn trong thân máy bay
  const renderAircraftSeatLayout = (allSeats: any[], seatLayoutConfig: Record<string, string>) => {
    if (!allSeats || allSeats.length === 0) {
      return null;
    }

    // Nhóm ghế theo hàng
    const seatsByRow: Record<number, any[]> = {};
    allSeats.forEach(seat => {
      // Parse seatNumber: có thể là "1A", "01A", "E-1A", "B-1A", v.v.
      const match = seat.seatNumber?.match(/(?:[A-Z]+-)?(\d+)([A-Z]+)/);
      if (match) {
        const row = parseInt(match[1], 10); // Parse với base 10 để đảm bảo đúng
        if (!isNaN(row) && row > 0) {
          if (!seatsByRow[row]) {
            seatsByRow[row] = [];
          }
          seatsByRow[row].push(seat);
        }
      }
    });

    // Sắp xếp ghế trong mỗi hàng theo chữ cái
    Object.keys(seatsByRow).forEach(row => {
      seatsByRow[parseInt(row)].sort((a, b) => {
        const matchA = a.seatNumber?.match(/(?:[A-Z]+-)?\d+([A-Z]+)/);
        const matchB = b.seatNumber?.match(/(?:[A-Z]+-)?\d+([A-Z]+)/);
        if (!matchA || !matchB) return 0;
        return matchA[1].localeCompare(matchB[1]);
      });
    });

    const rows = Object.keys(seatsByRow).map(Number).sort((a, b) => a - b);

    // Tạo map ghế theo vị trí trong layout
    const createSeatMap = (rowSeats: any[], layoutSections: number[]) => {
      const seatMap: Record<number, Record<number, any>> = {};

      rowSeats.forEach(seat => {
        const match = seat.seatNumber?.match(/(?:[A-Z]+-)?\d+([A-Z]+)/);
        if (match) {
          const seatLetter = match[1];
          const position = getSeatPositionInLayout(seatLetter, layoutSections);
          if (position) {
            if (!seatMap[position.section]) {
              seatMap[position.section] = {};
            }
            seatMap[position.section][position.position] = seat;
          }
        }
      });

      return seatMap;
    };

    const fallbackLayout = (rowSeats: any[]) => {
      const seatCount = rowSeats?.length || 0;
      return seatCount > 0 ? [seatCount] : [];
    };

    let lastCabin: string | null = null;
    const cabinLabels: Array<{ rowNum: number; cabin: string }> = [];

    return (
      <div className="aircraft-diagram-wrapper">
        <div className="aircraft-diagram">
          <div className="aircraft-diagram__body">
            <div className="plane-seat-stack">
              {rows.map((rowNum) => {
                const rowSeats = seatsByRow[rowNum];
                const cabin = rowSeats[0]?.travelClass || 'Economy';
                const layoutString =
                  seatLayoutConfig?.[cabin] ||
                  defaultLayouts[cabin as keyof typeof defaultLayouts] ||
                  '';
                const layoutSections = parseLayout(layoutString);
                const layout = layoutSections.length > 0 ? layoutSections : fallbackLayout(rowSeats);
                const seatMap = createSeatMap(rowSeats, layout);
                const isCabinStart = cabin !== lastCabin;

                if (isCabinStart) {
                  cabinLabels.push({ rowNum, cabin });
                }
                lastCabin = cabin;

                return (
                  <React.Fragment key={rowNum}>
                    <div
                      className="plane-seat-row"
                      data-cabin={cabin}
                      data-row={rowNum}
                    >
                      <span className="plane-seat-row__number">{rowNum}</span>
                      <div className="plane-seat-row__groups">
                        {layout.map((cols, sectionIndex) => {
                          return (
                            <div key={sectionIndex} className="flex gap-1 plane-seat-block">
                              {Array.from({ length: cols }).map((_, colIndex) => {
                                const seat = seatMap[sectionIndex]?.[colIndex];

                                if (!seat) {
                                  return (
                                    <div
                                      key={colIndex}
                                      className="plane-seat plane-seat--empty w-8 h-8 sm:w-9 sm:h-9 border border-gray-200/80 rounded-xl bg-gray-50"
                                    />
                                  );
                                }

                                // Logic trạng thái: isAvailable = true (Hoạt động - xanh), isAvailable = false (Không hoạt động - đỏ)
                                const isAvailable = seat.isAvailable === true;

                                // Lấy chữ cái từ seatNumber
                                const letterMatch = seat.seatNumber?.match(/(?:[A-Z]+-)?\d+([A-Z]+)/);
                                const displayLetter = letterMatch ? letterMatch[1] : '';

                                const isSelected = selectedSeatId === seat.seatId;

                                return (
                                  <div
                                    key={seat.seatId}
                                    data-cabin={cabin}
                                    onClick={() => handleSelectSeatId(seat.seatId)}
                                    className={`plane-seat w-10 h-10 sm:w-11 sm:h-11 text-xs sm:text-sm text-center rounded-lg border-2 cursor-pointer flex items-center justify-center font-bold transition-all duration-200 ${isAvailable
                                      ? 'bg-green-100 border-green-400 text-green-700 hover:bg-green-200 hover:scale-110 hover:shadow-lg shadow-green-200/50'
                                      : 'bg-red-100 border-red-400 text-red-700 hover:bg-red-200 hover:scale-110 hover:shadow-lg shadow-red-200/50'
                                      } ${isSelected ? 'plane-seat--selected' : ''}`}
                                    title={`${seat.seatNumber} - ${seat.travelClass} - ${isAvailable ? 'Hoạt động' : 'Không hoạt động'}`}
                                  >
                                    {displayLetter}
                                  </div>
                                );
                              })}
                              {sectionIndex < layout.length - 1 && (
                                <div className="plane-seat-gap w-4 sm:w-5 flex items-center justify-center" aria-hidden="true">
                                  <span className="plane-seat-gap__line"></span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Nhãn hạng bên ngoài máy bay */}
        <div className="aircraft-cabin-labels">
          {cabinLabels.map(({ rowNum, cabin }) => (
            <div
              key={`${cabin}-${rowNum}`}
              className="aircraft-cabin-label"
              data-cabin={cabin}
              data-row={rowNum}
            >
              {cabin} CLASS
            </div>
          ))}
        </div>
      </div>
    );
  }
  const validateInputs = () => {
    const newErrors: any = {};

    if (!aircraftCode || aircraftCode.trim() === "") {
      newErrors.aircraftCode = "Vui lòng nhập mã máy bay.";
    } else if (aircraftCode.length > 10) {
      newErrors.aircraftCode = "Mã máy bay không được dài quá 10 ký tự.";
    }

    if (!model || model.trim() === "") {
      newErrors.model = "Vui lòng nhập model máy bay.";
    } else if (model.length > 100) {
      newErrors.model = "Tên model không được dài quá 100 ký tự.";
    }

    if (!airlineId) {
      newErrors.airlineId = "Vui lòng chọn hãng hàng không.";
    }

    if (economyCapacity === null || economyCapacity < 0) {
      newErrors.economyCapacity = "Vui lòng nhập sức chứa hợp lệ cho hạng Economy.";
    }

    if (businessCapacity === null || businessCapacity < 0) {
      newErrors.businessCapacity = "Vui lòng nhập sức chứa hợp lệ cho hạng Business.";
    }

    if (firstClassCapacity === null || firstClassCapacity < 0) {
      newErrors.firstClassCapacity = "Vui lòng nhập sức chứa hợp lệ cho hạng First Class.";
    }

    // if (!lastMaintenance) {
    //   newErrors.lastMaintenance = "Vui lòng chọn ngày bảo trì gần nhất.";
    // }

    // if (!nextMaintenance) {
    //   newErrors.nextMaintenance = "Vui lòng chọn ngày bảo trì tiếp theo.";
    // }

    if (lastMaintenance && nextMaintenance) {
      const last = new Date(lastMaintenance);
      const next = new Date(nextMaintenance);
      if (next < last) {
        newErrors.nextMaintenance = "Ngày bảo trì tiếp theo phải sau ngày gần nhất.";
      }
    }

    const { layout } = seatLayoutJSON;
    const validLayout = (value: string) => {
      // Cho phép rỗng, 'custom', hoặc format hợp lệ (số-số-số...)
      if (!value || value === "" || value === "custom") {
        return true;
      }
      return /^[0-9]+(-[0-9]+)*$/.test(value);
    };

    // Chỉ validate layout nếu capacity > 0
    if (layout) {
      if (economyCapacity !== null && economyCapacity > 0 && !validLayout(layout.Economy)) {
        newErrors.layoutEconomy = "Định dạng không hợp lệ (VD: 3-3-3).";
      }
      if (businessCapacity !== null && businessCapacity > 0 && !validLayout(layout.Business)) {
        newErrors.layoutBusiness = "Định dạng không hợp lệ (VD: 2-2-2).";
      }
      if (firstClassCapacity !== null && firstClassCapacity > 0 && !validLayout(layout.First)) {
        newErrors.layoutFirst = "Định dạng không hợp lệ (VD: 1-2-1).";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Trả về true nếu không có lỗi
  };


  const clearForm = () => {
    setAircraftCode("");
    setModel("");
    setAirlineId(null);
    setEconomyCapacity(null);
    setBusinessCapacity(null);
    setFirstClassCapacity(null);
    setSeatLayoutJSON({
      layout: { Economy: "", Business: "", First: "" },
      hasWiFi: false,
      hasPremiumEntertainment: false,
    });
    setLastMaintenance("");
    setNextMaintenance("");
    setIsActive(true);
    setShowAddModal(false);
    setErrors({});
    setUpdateErrors({})
  }


  const addAircraft = (): void => {
    const isValid = validateInputs();
    if (!isValid) return; // Dừng nếu có lỗi

    const aircraftData = {
      aircraftCode,
      model,
      airlineId,
      economyCapacity,
      businessCapacity,
      firstClassCapacity,
      seatLayoutJSON,
      lastMaintenance: lastMaintenance ? lastMaintenance : null,
      nextMaintenance: nextMaintenance ? nextMaintenance : null,
      isActive,
    };
    setLoading(true);

    requestApi("aircrafts", "POST", aircraftData)
      .then((res: any) => {
        if (res.success) {
          showNotification('success', 'Thêm máy bay thành công');
          loadAircrafts();
          clearForm()
          setLoading(false)

        } else if (res.errorCode === 'AIRCRAFT_EXISTS') {
          setErrors((prev: any) => ({
            ...prev,
            aircraftCode: "Mã máy bay đã tồn tại",
          }));
          showNotification('error', 'Thêm máy bay thất bại', 'Mã máy bay đã tồn tại');
        }
        else {
          showNotification('error', 'Thêm máy bay thất bại', res.message || 'Vui lòng thử lại');
        }
      })
      .catch((error: any) => {
        console.error(error);
        showNotification('error', 'Thêm máy bay thất bại', error?.message || 'Đã xảy ra lỗi không xác định');
      }).finally(() => {
        // chỉ tắt loading sau khi mọi thứ hoàn tất
        setLoading(false);
      });
  };




  // Khi chọn 1 máy bay → load dữ liệu vào form
  const handleSelectAircraft = (id: string) => {
    const aircraft: any = AircraftsList.find((a: any) => a.aircraftId === Number(id));
    if (aircraft) {
      setSelectedId(aircraft.aircraftId);
      setAircraftUpdateData({
        aircraftCode: aircraft.aircraftCode || "",
        model: aircraft.model || "",
        economyCapacity: aircraft.economyCapacity || 0,
        businessCapacity: aircraft.businessCapacity || 0,
        firstClassCapacity: aircraft.firstClassCapacity || 0,
        seatLayoutJSON: aircraft.seatLayoutJSON || {
          layout: { Economy: "", Business: "", First: "" },
          hasWiFi: false,
          hasPremiumEntertainment: false,
        },
        lastMaintenance: aircraft.lastMaintenance
          ? aircraft.lastMaintenance.slice(0, 10)
          : null,
        nextMaintenance: aircraft.nextMaintenance
          ? aircraft.nextMaintenance.slice(0, 10)
          : null,
        isActive: aircraft.isActive ?? true,
      });
    }
  };

  const handleChange = (field: string, value: any) => {
    setAircraftUpdateData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSeatLayoutChange = (cls: string, value: string) => {
    setAircraftUpdateData((prev) => ({
      ...prev,
      seatLayoutJSON: {
        ...prev.seatLayoutJSON,
        layout: { ...prev.seatLayoutJSON.layout, [cls]: value },
      },
    }));
  };


  const validateUpdateInputs = () => {
    const newErrors: any = {};

    // if (!aircraftUpdateData.aircraftCode || aircraftUpdateData.aircraftCode.trim() === "") {
    //   newErrors.aircraftCode = "Vui lòng nhập mã máy bay.";
    // } else if (
    //   aircraftUpdateData.aircraftCode.length < 2 ||
    //   aircraftUpdateData.aircraftCode.length > 10
    // ) {
    //   newErrors.aircraftCode = "Mã máy bay phải từ 2–10 ký tự.";
    // }

    if (!aircraftUpdateData.model || aircraftUpdateData.model.trim() === "") {
      newErrors.model = "Vui lòng nhập model máy bay.";
    } else if (aircraftUpdateData.model.length > 100) {
      newErrors.model = "Tên model không được dài quá 100 ký tự.";
    }

    if (
      aircraftUpdateData.economyCapacity === null ||
      aircraftUpdateData.economyCapacity < 0
    ) {
      newErrors.economyCapacity = "Sức chứa Economy không hợp lệ.";
    }

    if (
      aircraftUpdateData.businessCapacity === null ||
      aircraftUpdateData.businessCapacity < 0
    ) {
      newErrors.businessCapacity = "Sức chứa Business không hợp lệ.";
    }

    if (
      aircraftUpdateData.firstClassCapacity === null ||
      aircraftUpdateData.firstClassCapacity < 0
    ) {
      newErrors.firstClassCapacity = "Sức chứa First Class không hợp lệ.";
    }

    // Kiểm tra bố trí ghế (layout) - chỉ validate nếu capacity > 0
    const { layout } = aircraftUpdateData.seatLayoutJSON;
    const validLayout = (value: string) => {
      // Cho phép rỗng, 'custom', hoặc format hợp lệ (số-số-số...)
      if (!value || value === "" || value === "custom") {
        return true;
      }
      return /^[0-9]+(-[0-9]+)*$/.test(value);
    };

    if (layout) {
      if (aircraftUpdateData.economyCapacity > 0 && !validLayout(layout.Economy)) {
        newErrors.layoutEconomy = "Định dạng không hợp lệ (VD: 3-3-3).";
      }
      if (aircraftUpdateData.businessCapacity > 0 && !validLayout(layout.Business)) {
        newErrors.layoutBusiness = "Định dạng không hợp lệ (VD: 2-2-2).";
      }
      if (aircraftUpdateData.firstClassCapacity > 0 && !validLayout(layout.First)) {
        newErrors.layoutFirst = "Định dạng không hợp lệ (VD: 1-2-1).";
      }
    }

    // Ngày bảo trì
    if (aircraftUpdateData.lastMaintenance && aircraftUpdateData.nextMaintenance) {
      const last = new Date(aircraftUpdateData.lastMaintenance);
      const next = new Date(aircraftUpdateData.nextMaintenance);
      if (next < last) newErrors.nextMaintenance = "Ngày bảo trì tiếp theo phải sau ngày gần nhất.";
    }

    setUpdateErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const updateAircraft = (): void => {
    const isValid = validateUpdateInputs();
    if (!isValid) return; // nếu có lỗi thì dừng

    requestApi(`aircrafts/${String(selectedId)}`, "PUT", aircraftUpdateData)
      .then((res: any) => {
        if (res.success) {
          showNotification('success', 'Cập nhật thông tin máy bay thành công!');
          loadAircrafts();
          setShowUpdateModal(false)
        } else {
          showNotification('error', 'Cập nhật thất bại', res.message || 'Vui lòng thử lại');
        }
      })
      .catch((error: any) => {
        showNotification('error', 'Cập nhật thất bại', error?.message || 'Đã xảy ra lỗi không xác định');
      });
  };
  const deleteAicraft = (id: string): void => {
    requestApi(`aircrafts/${id}`, "DELETE").then((res: any) => {
      if (res.success) {
        showNotification('success', 'Xóa máy bay thành công!');
        loadAircrafts();
      } else {
        showNotification('error', 'Xóa thất bại', res.message || 'Vui lòng thử lại');
      }
    }).catch((error: any) => {
      showNotification('error', 'Xóa thất bại', error?.message || 'Đã xảy ra lỗi không xác định');
    })
  }
  const [maintenances, setMaintenances] = useState<ExtendedMaintenance[]>([
    {
      id: 1,
      aircraftID: 1,
      aircraftName: 'Boeing 737-800',
      type: 'Scheduled',
      description: 'Kiểm tra định kỳ 6 tháng',
      scheduledDate: '2024-01-20',
      completedDate: '2024-01-20',
      status: 'Completed',
      technician: 'Nguyễn Văn A',
      duration: 8
    },
    {
      id: 2,
      aircraftID: 3,
      aircraftName: 'Boeing 787-9',
      type: 'Unscheduled',
      description: 'Sửa chữa động cơ',
      scheduledDate: '2024-01-15',
      status: 'In Progress',
      technician: 'Trần Văn B',
      duration: 24
    },
    {
      id: 3,
      aircraftID: 2,
      aircraftName: 'Airbus A320',
      type: 'Scheduled',
      description: 'Bảo dưỡng hệ thống điều hòa',
      scheduledDate: '2024-01-25',
      status: 'Scheduled',
      technician: 'Lê Văn C',
      duration: 12
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-100';
      case 'Maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'Inactive': return 'text-red-600 bg-red-100';
      case 'Available': return 'text-green-600 bg-green-100';
      case 'Occupied': return 'text-blue-600 bg-blue-100';
      case 'Scheduled': return 'text-blue-600 bg-blue-100';
      case 'In Progress': return 'text-yellow-600 bg-yellow-100';
      case 'Completed': return 'text-green-600 bg-green-100';
      case 'Cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Active': return 'Hoạt động';
      case 'Maintenance': return 'Bảo trì';
      case 'Inactive': return 'Không hoạt động';
      case 'Available': return 'Trống';
      case 'Occupied': return 'Đã đặt';
      case 'Scheduled': return 'Đã lên lịch';
      case 'In Progress': return 'Đang thực hiện';
      case 'Completed': return 'Hoàn thành';
      case 'Cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const filteredAircrafts = AircraftsList.filter((aircraft: any) => {
    const matchesSearch =
      aircraft.aircraftCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aircraft.airline.airlineName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || (statusFilter === 'Active' ? aircraft.isActive : !aircraft.isActive);
    return matchesSearch && matchesStatus;
  });

  const generateAircraftCode = (airlineId: number, model: string) => {
    // Tìm hãng hàng không tương ứng
    const selectedAirline: any = airlines.find((a: any) => a.airlineId === Number(airlineId));
    if (!selectedAirline) return "";

    const airlineCode = selectedAirline.airlineCode || "XX";

    // Lấy ký tự đầu tiên trong model (VD: Boeing → B, Airbus → A)
    const typeInitial = model?.trim()?.charAt(0).toUpperCase() || "X";

    // Lọc danh sách aircraft có cùng airlineCode và typeInitial
    const filteredAircrafts = AircraftsList.filter((ac: any) =>
      ac.aircraftCode?.startsWith(`${airlineCode}-${typeInitial}`)
    );

    // Lấy số thứ tự lớn nhất hiện tại
    let maxNumber = 0;
    filteredAircrafts.forEach((ac: any) => {
      const match = ac.aircraftCode?.match(/\d+$/); // lấy phần số ở cuối mã
      if (match) {
        const num = parseInt(match[0], 10);
        if (num > maxNumber) maxNumber = num;
      }
    });

    //Tạo mã mới
    const nextNumber = (maxNumber + 1).toString().padStart(3, "0");
    const newCode = `${airlineCode}-${typeInitial}${nextNumber}`;

    return newCode;
  };
  const [selectedSeatId, setSelectedSeatId] = useState(0)
  const [seatDataUpdate, setSeatDataUpdate] = useState<any>({
    seatNumber: "",
    travelClass: "Economy",
    isAvailable: true,
  });
  const handleSelectSeatId = (id: string) => {
    requestApi(`seats/${id}`, "GET").then((res: any) => {
      if (res.success)
        setSeatDataUpdate(res.data)
      setSelectedSeatId(Number(id))
    }).catch((err: any) => {
      console.error(err)
    })
  }

  const handleUpdateSeat = () => {
    if (!selectAircraftId) {
      showNotification('warning', 'Vui lòng chọn máy bay');
      return
    }
    if (!selectedSeatId || selectedSeatId === 0) {
      showNotification('warning', 'Vui lòng chọn ghế từ sơ đồ');
      return
    }
    if (!seatDataUpdate.seatNumber) {
      showNotification('error', 'Thông tin ghế không hợp lệ');
      return
    }

    setLoading(true)
    requestApi(`seats/${String(selectedSeatId)}`, "PUT", seatDataUpdate).then((res: any) => {
      if (res.success) {
        showNotification('success', 'Cập nhật ghế thành công');
        // Reload ghế để cập nhật UI
        loadSeatsByAircraftId(selectAircraftId)
        // Reset form
        setSelectedSeatId(0)
        setSeatDataUpdate({
          seatNumber: "",
          travelClass: "Economy",
          isAvailable: true,
        })
      } else {
        showNotification('error', 'Cập nhật ghế thất bại', res.message || 'Vui lòng thử lại');
      }
    }).catch((err: any) => {
      console.error(err)
      showNotification('error', 'Cập nhật ghế thất bại', err?.message || 'Đã xảy ra lỗi không xác định');
    }).finally(() => {
      setLoading(false)
    })
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-2xl font-bold text-black">Vui lòng đợi...</div>;
  }
  // Render content based on active sub-tab
  const renderSubContent = () => {
    switch (activeSubTab) {
      case 'aircraft-add':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm máy bay mới</h3>
              <form
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  addAircraft();
                }}
              >
                {/* --- MODEL --- */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => {
                      const value = e.target.value;
                      setModel(value);
                      setErrors((prev: any) => ({ ...prev, model: "" }));
                      if (airlineId) {
                        const code = generateAircraftCode(airlineId, value);
                        setAircraftCode(code);
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 ${errors.model ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder="Nhập tên mẫu máy bay"
                  />
                  {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
                </div>

                {/* --- HÃNG HÀNG KHÔNG --- */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Hãng hàng không</label>
                  <select
                    value={airlineId ?? ""}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setAirlineId(id);
                      setErrors((prev: any) => ({ ...prev, airlineId: "" }));
                      if (model) {
                        const code = generateAircraftCode(id, model);
                        setAircraftCode(code);
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 ${errors.airlineId ? "border-red-500" : "border-gray-300"
                      }`}
                  >
                    <option value="">Chọn hãng hàng không</option>
                    {airlines.map((airline: any) => {
                      return (
                        <option key={airline.airlineId} value={airline.airlineId}>{airline.airlineName}</option>
                      )
                    })}

                  </select>
                  {errors.airlineId && (
                    <p className="text-red-500 text-sm mt-1">{errors.airlineId}</p>
                  )}
                </div>

                {/* --- ECONOMY --- */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Sức chứa hạng Economy
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={economyCapacity ?? ""}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setEconomyCapacity(value);
                      setErrors((prev: any) => ({ ...prev, economyCapacity: "" }));
                      // Tự động set layout mặc định nếu capacity > 0 và chưa có layout
                      if (value > 0) {
                        const currentLayout = (seatLayoutJSON.layout as any).Economy;
                        if (!currentLayout || currentLayout === '') {
                          setSeatLayoutJSON((prev) => ({
                            ...prev,
                            layout: { ...prev.layout, Economy: defaultLayouts.Economy },
                          }));
                        }
                      } else {
                        setSeatLayoutJSON((prev) => ({
                          ...prev,
                          layout: { ...prev.layout, Economy: "" },
                        }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 ${errors.economyCapacity ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder="Nhập sức chứa hạng Economy"
                  />
                  {errors.economyCapacity && (
                    <p className="text-red-500 text-sm mt-1">{errors.economyCapacity}</p>
                  )}
                </div>

                {/* --- BUSINESS --- */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Sức chứa hạng Business
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={businessCapacity ?? ""}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setBusinessCapacity(value);
                      setErrors((prev: any) => ({ ...prev, businessCapacity: "" }));
                      // Tự động set layout mặc định nếu capacity > 0 và chưa có layout
                      if (value > 0) {
                        const currentLayout = (seatLayoutJSON.layout as any).Business;
                        if (!currentLayout || currentLayout === '') {
                          setSeatLayoutJSON((prev) => ({
                            ...prev,
                            layout: { ...prev.layout, Business: defaultLayouts.Business },
                          }));
                        }
                      } else {
                        setSeatLayoutJSON((prev) => ({
                          ...prev,
                          layout: { ...prev.layout, Business: "" },
                        }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 ${errors.businessCapacity ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder="Nhập sức chứa hạng Business"
                  />
                  {errors.businessCapacity && (
                    <p className="text-red-500 text-sm mt-1">{errors.businessCapacity}</p>
                  )}
                </div>

                {/* --- FIRST CLASS --- */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Sức chứa hạng First Class
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={firstClassCapacity ?? ""}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setFirstClassCapacity(value);
                      setErrors((prev: any) => ({ ...prev, firstClassCapacity: "" }));
                      // Tự động set layout mặc định nếu capacity > 0 và chưa có layout
                      if (value > 0) {
                        const currentLayout = (seatLayoutJSON.layout as any).First;
                        if (!currentLayout || currentLayout === '') {
                          setSeatLayoutJSON((prev) => ({
                            ...prev,
                            layout: { ...prev.layout, First: defaultLayouts.First },
                          }));
                        }
                      } else {
                        setSeatLayoutJSON((prev) => ({
                          ...prev,
                          layout: { ...prev.layout, First: "" },
                        }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 ${errors.firstClassCapacity ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder="Nhập sức chứa hạng First Class"
                  />
                  {errors.firstClassCapacity && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstClassCapacity}</p>
                  )}
                </div>

                {/* --- BỐ TRÍ GHẾ --- */}
                <div className="md:col-span-2 border-t pt-4">
                  <h4 className="text-md font-medium text-gray-700 mb-1">Bố trí ghế (Layout)</h4>
                  <p className="text-sm text-gray-500 mb-3">
                    Layout mặc định: First Class = <span className="font-semibold">1-2-1</span>,
                    Business = <span className="font-semibold">2-2-2</span>,
                    Economy = <span className="font-semibold">3-3-3</span>. Bạn có thể chọn layout khác nếu cần.
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {["First", "Business", "Economy"].map((cls) => {
                      const labels: Record<string, string> = {
                        Economy: "Economy",
                        Business: "Business",
                        First: "First Class",
                      };
                      const descriptions: Record<string, string> = {
                        Economy: "Hạng phổ thông",
                        Business: "Hạng thương gia",
                        First: "Hạng nhất",
                      };
                      const currentValue = (seatLayoutJSON.layout as any)[cls] || "";
                      const showCustomInput = currentValue === 'custom' || (currentValue && !layoutOptions[cls as keyof typeof layoutOptions].some(opt => opt.value === currentValue && opt.value !== ''));
                      const displayValue = currentValue === 'custom' ? '' : currentValue;
                      const hasCapacity =
                        (cls === 'First' && firstClassCapacity && firstClassCapacity > 0) ||
                        (cls === 'Business' && businessCapacity && businessCapacity > 0) ||
                        (cls === 'Economy' && economyCapacity && economyCapacity > 0);

                      return (
                        <div key={cls}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {labels[cls]}
                            <span className="text-xs text-gray-500 ml-1">({descriptions[cls]})</span>
                          </label>
                          {hasCapacity ? (
                            !showCustomInput ? (
                              <select
                                value={currentValue || defaultLayouts[cls as keyof typeof defaultLayouts]}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setSeatLayoutJSON((prev) => ({
                                    ...prev,
                                    layout: { ...prev.layout, [cls]: value },
                                  }));
                                  setErrors((prev: any) => ({ ...prev, [`layout${cls}`]: "" }));
                                }}
                                className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 ${errors[`layout${cls}`] ? "border-red-500" : "border-gray-300"
                                  }`}
                              >
                                {layoutOptions[cls as keyof typeof layoutOptions].map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div>
                                <input
                                  type="text"
                                  placeholder="VD: 3-3-3"
                                  value={displayValue}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setSeatLayoutJSON((prev) => ({
                                      ...prev,
                                      layout: { ...prev.layout, [cls]: value },
                                    }));
                                    setErrors((prev: any) => ({ ...prev, [`layout${cls}`]: "" }));
                                  }}
                                  className={`w-full px-3 py-2 border rounded-lg text-black ${errors[`layout${cls}`] ? "border-red-500" : "border-gray-300"
                                    }`}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSeatLayoutJSON((prev) => ({
                                      ...prev,
                                      layout: { ...prev.layout, [cls]: defaultLayouts[cls as keyof typeof defaultLayouts] },
                                    }));
                                  }}
                                  className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                                >
                                  Quay lại chọn layout
                                </button>
                              </div>
                            )
                          ) : (
                            <div className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm">
                              Không có hạng này
                            </div>
                          )}
                          {errors[`layout${cls}`] && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors[`layout${cls}`]}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center space-x-4 mt-3">
                    <label className="flex items-center space-x-2">
                      <input
                        checked={seatLayoutJSON.hasWiFi}
                        type="checkbox"
                        onChange={(e) =>
                          setSeatLayoutJSON((prev) => ({
                            ...prev,
                            hasWiFi: e.target.checked,
                          }))
                        }
                      />
                      <label className='text-md font-medium text-gray-700 '>Có WiFi</label>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        checked={seatLayoutJSON.hasPremiumEntertainment}
                        type="checkbox"
                        onChange={(e) =>
                          setSeatLayoutJSON((prev) => ({
                            ...prev,
                            hasPremiumEntertainment: e.target.checked,
                          }))
                        }
                      />
                      <label className='text-md font-medium text-gray-700'>Giải trí cao cấp</label>
                    </label>
                  </div>
                </div>

                {/* --- BẢO TRÌ --- */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Ngày bảo trì gần nhất
                  </label>
                  <input
                    type="date"
                    value={lastMaintenance}
                    onChange={(e) => {
                      setLastMaintenance(e.target.value);
                      setErrors((prev: any) => ({ ...prev, lastMaintenance: "" }));
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black ${errors.lastMaintenance ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {errors.lastMaintenance && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastMaintenance}</p>
                  )}
                </div>


                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Ngày bảo trì tiếp theo
                  </label>
                  <input
                    type="date"
                    value={nextMaintenance}
                    onChange={(e) => {
                      setNextMaintenance(e.target.value);
                      setErrors((prev: any) => ({ ...prev, nextMaintenance: "" }));
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black ${errors.nextMaintenance ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {errors.nextMaintenance && (
                    <p className="text-red-500 text-sm mt-1">{errors.nextMaintenance}</p>
                  )}
                </div>

                {/* --- TRẠNG THÁI --- */}
                <div className="md:col-span-2 flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <label className="text-md font-medium text-gray-700">Hoạt động</label>
                </div>

                {/* --- BUTTONS --- */}
                <div className="md:col-span-2 flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => clearForm()}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Thêm máy bay
                  </button>
                </div>
              </form>

            </div>
          </div>
        );

      case 'aircraft-edit':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sửa thông tin máy bay
              </h3>

              {/* Chọn máy bay */}
              <div className="mb-4">
                <label className="block text-md font-medium text-gray-700 mb-1">
                  Chọn máy bay để chỉnh sửa
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  onChange={(e) => handleSelectAircraft(e.target.value)}
                  value={selectedId || ""}
                >
                  <option value="">Chọn máy bay</option>
                  {AircraftsList.map((aircraft: any) => (
                    <option key={aircraft.aircraftId} value={aircraft.aircraftId}>
                      {aircraft.aircraftCode} - {aircraft.model}
                    </option>
                  ))}
                </select>
              </div>

              {/* Form chỉnh sửa */}
              <form
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  updateAircraft();
                }}
              >
                {/* Mã máy bay */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Mã máy bay
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={aircraftUpdateData.aircraftCode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    value={aircraftUpdateData.model}
                    onChange={(e) => {
                      handleChange("model", e.target.value)
                      setUpdateErrors((prev: any) => ({ ...prev, model: "" }))
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  />
                  {updateErrors.model && (
                    <p className="text-red-500 text-sm mt-1">{updateErrors.model}</p>
                  )}
                </div>
                {/* Bố trí ghế */}
                <div className="md:col-span-2 border-t pt-4">
                  {/* <h4 className="text-md font-medium text-gray-700 mb-1">Bố trí ghế</h4>
                            <div className="grid grid-cols-3 gap-3">
                              {(["Economy", "Business", "First"] as const).map((cls) => (
                                <div key={cls}>
                                  <input
                                    type="text"
                                    placeholder={`${cls} (VD: ${
                                      cls === "Economy"
                                        ? "3-3-3"
                                        : cls === "Business"
                                        ? "2-2-2"
                                        : "1-2-1"
                                    })`}
                                    value={aircraftUpdateData.seatLayoutJSON.layout[cls] || ""}
                                    onChange={(e) => handleSeatLayoutChange(cls, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                                  />
                                  {updateErrors[`layout${cls}`] && (
                                    <p className="text-red-500 text-sm mt-1">
                                      {updateErrors[`layout${cls}`]}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div> */}

                  {/* Tùy chọn tiện ích */}
                  <div className="flex items-center gap-4 mt-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={aircraftUpdateData.seatLayoutJSON.hasWiFi}
                        onChange={(e) =>
                          setAircraftUpdateData((prev) => ({
                            ...prev,
                            seatLayoutJSON: {
                              ...prev.seatLayoutJSON,
                              hasWiFi: e.target.checked,
                            },
                          }))
                        }
                      />
                      <span className="text-md font-medium text-gray-700 mb-1">Có WiFi</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={
                          aircraftUpdateData.seatLayoutJSON.hasPremiumEntertainment
                        }
                        onChange={(e) =>
                          setAircraftUpdateData((prev) => ({
                            ...prev,
                            seatLayoutJSON: {
                              ...prev.seatLayoutJSON,
                              hasPremiumEntertainment: e.target.checked,
                            },
                          }))
                        }
                      />
                      <span className="text-md font-medium text-gray-700 mb-1">
                        Giải trí cao cấp
                      </span>
                    </label>
                  </div>
                </div>

                {/* Ngày bảo trì */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Ngày bảo trì gần nhất
                  </label>
                  <input
                    type="date"
                    value={aircraftUpdateData.lastMaintenance}
                    onChange={(e) => handleChange("lastMaintenance", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  />
                </div>

                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Ngày bảo trì tiếp theo
                  </label>
                  <input
                    type="date"
                    value={aircraftUpdateData.nextMaintenance}
                    onChange={(e) => handleChange("nextMaintenance", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  />
                  {errors.nextMaintenance && (
                    <p className="text-red-500 text-sm mt-1">{errors.nextMaintenance}</p>
                  )}
                </div>

                {/* Trạng thái */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={aircraftUpdateData.isActive ? "true" : "false"}
                    onChange={(e) => handleChange("isActive", e.target.value === "true")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  >
                    <option value="true">Đang hoạt động</option>
                    <option value="false">Ngưng hoạt động</option>
                  </select>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex justify-end space-x-3 md:col-span-2">
                  <button
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    onClick={() => setSelectedId(null)}
                  >
                    Hủy
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    type="submit"
                  >
                    Cập nhật thông tin
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      case 'aircraft-seats':
        const seatLayout = selectedAircraft?.seatLayoutJSON?.layout || {};
        const hasSeats = seats.length > 0;

        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <label className="block text-md font-medium text-gray-700 mb-1">Chọn máy bay</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  value={selectAircraftId || ""}
                  onChange={(e: any) => {
                    const aircraftId = e.target.value;
                    if (aircraftId) {
                      loadSeatsByAircraftId(Number(aircraftId));
                      setSelectAircraftId(Number(aircraftId));
                      setSelectedSeatId(0);
                    } else {
                      setSelectAircraftId(0);
                      setSeats([]);
                      setSelectedAircraft(null);
                      setSelectedSeatId(0);
                    }
                  }}
                >
                  <option value="">Chọn máy bay</option>
                  {AircraftsList.map((aircraft: any) => (
                    <option key={aircraft.aircraftId} value={aircraft.aircraftId}>
                      {aircraft.aircraftCode} - {aircraft.model}
                    </option>
                  ))}
                </select>
              </div>

              {selectAircraftId && selectedAircraft ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Sơ đồ chỗ ngồi</h4>

                  {hasSeats && renderAircraftSeatLayout(seats, seatLayout)}

                  {!hasSeats && (
                    <div className="text-center text-gray-500 py-4">
                      Máy bay này chưa có ghế nào
                    </div>
                  )}

                  {/* Legend */}
                  <div className="mt-6 flex flex-wrap gap-4 text-sm justify-center md:justify-start">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded shadow-green-200/50"></div>
                      <span className="font-medium text-green-700">Hoạt động</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                      <div className="w-4 h-4 bg-red-100 border-2 border-red-400 rounded shadow-red-200/50"></div>
                      <span className="font-medium text-red-700">Không hoạt động</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                  Vui lòng chọn máy bay để xem sơ đồ chỗ ngồi
                </div>
              )}

              {/* Form cập nhật ghế */}
              <div className="mt-6 border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Cập nhật thông tin ghế</h4>

                {selectedSeatId > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">Đã chọn ghế:</span> {seatDataUpdate.seatNumber} - {seatDataUpdate.travelClass}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Số ghế (readonly) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số ghế <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={seatDataUpdate.seatNumber || ""}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                          placeholder="Chưa chọn ghế"
                        />
                      </div>

                      {/* Hạng ghế (readonly) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hạng ghế <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={seatDataUpdate.travelClass || "Economy"}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                        >
                          <option value="Economy">Economy</option>
                          <option value="Business">Business</option>
                          <option value="First">First</option>
                        </select>
                      </div>

                      {/* Trạng thái */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Trạng thái <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={seatDataUpdate?.isAvailable === true ? 'Active' : 'Inactive'}
                          onChange={(e) => {
                            const value = e.target.value;
                            const isAvailable = value === 'Active';

                            setSeatDataUpdate((prev: any) => ({
                              ...prev,
                              isAvailable
                            }));
                          }}
                          disabled={!selectedSeatId || selectedSeatId === 0}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${!selectedSeatId || selectedSeatId === 0 ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                        >
                          <option value="Active">Hoạt động</option>
                          <option value="Inactive">Không hoạt động</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSeatId(0);
                          setSeatDataUpdate({
                            seatNumber: "",
                            travelClass: "Economy",
                            isAvailable: true,
                          });
                        }}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleUpdateSeat}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Đang cập nhật...' : 'Cập nhật ghế'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <p className="text-gray-500 text-sm">
                      Vui lòng chọn một ghế từ sơ đồ phía trên để cập nhật thông tin
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm máy bay..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="Active">Hoạt động</option>
                  <option value="Maintenance">Bảo trì</option>
                  <option value="Inactive">Không hoạt động</option>
                </select>
              </div>
            </div>

            {/* Aircraft List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Danh sách máy bay</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Máy bay
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Mẫu
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Hãng hàng không
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Sức chứa
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAircrafts.map((aircraft: any) => (
                      // console.log('aircraft', aircraft),
                      <tr key={aircraft.aircraftId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <RocketLaunchIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{aircraft.aircraftCode}</div>
                              <div className="text-sm text-gray-500">{aircraft.model}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {aircraft.model}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {aircraft.airline.airlineName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {aircraft.economyCapacity + aircraft.businessCapacity + aircraft.firstClassCapacity} ghế
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${aircraft.isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                            {aircraft.isActive ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button className="text-green-600 hover:text-green-900" onClick={() => { setShowUpdateModal(true), handleSelectAircraft(aircraft.aircraftId) }}>
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button className="text-red-600 hover:text-red-900" onClick={() => deleteAicraft(aircraft.aircraftId)}>
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {activeSubTab === 'aircraft-add' ? 'Thêm máy bay mới' :
              activeSubTab === 'aircraft-edit' ? 'Sửa thông tin máy bay' :
                activeSubTab === 'aircraft-seats' ? 'Quản lý chỗ ngồi' :
                  'Quản lý máy bay'}
          </h2>
          <p className="text-gray-600">
            {activeSubTab === 'aircraft-add' ? 'Thêm máy bay mới vào hệ thống' :
              activeSubTab === 'aircraft-edit' ? 'Chỉnh sửa thông tin máy bay' :
                activeSubTab === 'aircraft-seats' ? 'Quản lý sơ đồ chỗ ngồi máy bay' :

                  'Quản lý thông tin máy bay và lịch trình bảo trì'}
          </p>
        </div>
        {activeSubTab === 'aircraft' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Thêm máy bay
          </button>
        )}
      </div>

      {/* Render sub-content */}
      {renderSubContent()}

      {/* Add Aircraft Modal - only show for main aircraft tab */}
      {activeSubTab === 'aircraft' && showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm máy bay mới</h3>

            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                addAircraft();
              }}
            >
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Model</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => {
                    const value = e.target.value;
                    setModel(value);
                    setErrors((prev: any) => ({ ...prev, model: "" }));
                    if (airlineId) {
                      const code = generateAircraftCode(airlineId, value);
                      setAircraftCode(code);
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 ${errors.model ? "border-red-500" : "border-gray-300"
                    }`}
                  placeholder="Nhập tên mẫu máy bay"
                />
                {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
              </div>

              {/* --- HÃNG HÀNG KHÔNG --- */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Hãng hàng không</label>
                <select
                  value={airlineId ?? ""}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setAirlineId(id);
                    setErrors((prev: any) => ({ ...prev, airlineId: "" }));
                    if (model) {
                      const code = generateAircraftCode(id, model);
                      setAircraftCode(code);
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 ${errors.airlineId ? "border-red-500" : "border-gray-300"
                    }`}
                >
                  <option value="">Chọn hãng hàng không</option>
                  {airlines.map((airline: any) => {
                    return (
                      <option key={airline.airlineId} value={airline.airlineId}>{airline.airlineName}</option>
                    )
                  })}
                </select>
                {errors.airlineId && (
                  <p className="text-red-500 text-sm mt-1">{errors.airlineId}</p>
                )}
              </div>

              {/* --- ECONOMY --- */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">
                  Sức chứa hạng Economy
                </label>
                <input
                  type="number"
                  min="1"
                  value={economyCapacity ?? ""}
                  onChange={(e) => {
                    setEconomyCapacity(Number(e.target.value));
                    setErrors((prev: any) => ({ ...prev, economyCapacity: "" }));
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 ${errors.economyCapacity ? "border-red-500" : "border-gray-300"
                    }`}
                  placeholder="Nhập sức chứa hạng Economy"
                />
                {errors.economyCapacity && (
                  <p className="text-red-500 text-sm mt-1">{errors.economyCapacity}</p>
                )}
              </div>

              {/* --- BUSINESS --- */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">
                  Sức chứa hạng Business
                </label>
                <input
                  type="number"
                  min="0"
                  value={businessCapacity ?? ""}
                  onChange={(e) => {
                    setBusinessCapacity(Number(e.target.value));
                    setErrors((prev: any) => ({ ...prev, businessCapacity: "" }));
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 ${errors.businessCapacity ? "border-red-500" : "border-gray-300"
                    }`}
                  placeholder="Nhập sức chứa hạng Business"
                />
                {errors.businessCapacity && (
                  <p className="text-red-500 text-sm mt-1">{errors.businessCapacity}</p>
                )}
              </div>

              {/* --- FIRST CLASS --- */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">
                  Sức chứa hạng First Class
                </label>
                <input
                  type="number"
                  min="0"
                  value={firstClassCapacity ?? ""}
                  onChange={(e) => {
                    setFirstClassCapacity(Number(e.target.value));
                    setErrors((prev: any) => ({ ...prev, firstClassCapacity: "" }));
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 ${errors.firstClassCapacity ? "border-red-500" : "border-gray-300"
                    }`}
                  placeholder="Nhập sức chứa hạng First Class"
                />
                {errors.firstClassCapacity && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstClassCapacity}</p>
                )}
              </div>

              {/* --- BỐ TRÍ GHẾ --- */}
              <div className="md:col-span-2 border-t pt-4">
                <h4 className="text-md font-medium text-gray-700 mb-1">Bố trí ghế (Layout)</h4>
                <p className="text-sm text-gray-500 mb-3">
                  Layout mặc định: First Class = <span className="font-semibold">1-2-1</span>,
                  Business = <span className="font-semibold">2-2-2</span>,
                  Economy = <span className="font-semibold">3-3-3</span>. Bạn có thể chọn layout khác nếu cần.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {["First", "Business", "Economy"].map((cls) => {
                    const labels: Record<string, string> = {
                      Economy: "Economy",
                      Business: "Business",
                      First: "First Class",
                    };
                    const descriptions: Record<string, string> = {
                      Economy: "Hạng phổ thông",
                      Business: "Hạng thương gia",
                      First: "Hạng nhất",
                    };
                    const currentValue = (seatLayoutJSON.layout as any)[cls] || "";
                    const showCustomInput = currentValue === 'custom' || (currentValue && !layoutOptions[cls as keyof typeof layoutOptions].some(opt => opt.value === currentValue && opt.value !== ''));
                    const displayValue = currentValue === 'custom' ? '' : currentValue;
                    const hasCapacity =
                      (cls === 'First' && firstClassCapacity && firstClassCapacity > 0) ||
                      (cls === 'Business' && businessCapacity && businessCapacity > 0) ||
                      (cls === 'Economy' && economyCapacity && economyCapacity > 0);

                    return (
                      <div key={cls}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {labels[cls]}
                          <span className="text-xs text-gray-500 ml-1">({descriptions[cls]})</span>
                        </label>
                        {hasCapacity ? (
                          !showCustomInput ? (
                            <select
                              value={currentValue || defaultLayouts[cls as keyof typeof defaultLayouts]}
                              onChange={(e) => {
                                const value = e.target.value;
                                setSeatLayoutJSON((prev) => ({
                                  ...prev,
                                  layout: { ...prev.layout, [cls]: value },
                                }));
                                setErrors((prev: any) => ({ ...prev, [`layout${cls}`]: "" }));
                              }}
                              className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 ${errors[`layout${cls}`] ? "border-red-500" : "border-gray-300"
                                }`}
                            >
                              {layoutOptions[cls as keyof typeof layoutOptions].map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div>
                              <input
                                type="text"
                                placeholder="VD: 3-3-3"
                                value={displayValue}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setSeatLayoutJSON((prev) => ({
                                    ...prev,
                                    layout: { ...prev.layout, [cls]: value },
                                  }));
                                  setErrors((prev: any) => ({ ...prev, [`layout${cls}`]: "" }));
                                }}
                                className={`w-full px-3 py-2 border rounded-lg text-black ${errors[`layout${cls}`] ? "border-red-500" : "border-gray-300"
                                  }`}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setSeatLayoutJSON((prev) => ({
                                    ...prev,
                                    layout: { ...prev.layout, [cls]: defaultLayouts[cls as keyof typeof defaultLayouts] },
                                  }));
                                }}
                                className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                              >
                                Quay lại chọn layout
                              </button>
                            </div>
                          )
                        ) : (
                          <div className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm">
                            Không có hạng này
                          </div>
                        )}
                        {errors[`layout${cls}`] && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors[`layout${cls}`]}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center space-x-4 mt-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        setSeatLayoutJSON((prev) => ({
                          ...prev,
                          hasWiFi: e.target.checked,
                        }))
                      }
                    />
                    <label className='text-md font-medium text-gray-700 '>Có WiFi</label>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        setSeatLayoutJSON((prev) => ({
                          ...prev,
                          hasPremiumEntertainment: e.target.checked,
                        }))
                      }
                    />
                    <label className='text-md font-medium text-gray-700'>Giải trí cao cấp</label>
                  </label>
                </div>
              </div>

              {/* --- BẢO TRÌ --- */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">
                  Ngày bảo trì gần nhất
                </label>
                <input
                  type="date"
                  value={lastMaintenance}
                  onChange={(e) => {
                    setLastMaintenance(e.target.value);
                    setErrors((prev: any) => ({ ...prev, lastMaintenance: "" }));
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black ${errors.lastMaintenance ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {errors.lastMaintenance && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastMaintenance}</p>
                )}
              </div>


              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">
                  Ngày bảo trì tiếp theo
                </label>
                <input
                  type="date"
                  value={nextMaintenance}
                  onChange={(e) => {
                    setNextMaintenance(e.target.value);
                    setErrors((prev: any) => ({ ...prev, nextMaintenance: "" }));
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black ${errors.nextMaintenance ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {errors.nextMaintenance && (
                  <p className="text-red-500 text-sm mt-1">{errors.nextMaintenance}</p>
                )}
              </div>

              {/* --- TRẠNG THÁI --- */}
              <div className="md:col-span-2 flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <label className="text-md font-medium text-gray-700">Hoạt động</label>
              </div>

              {/* --- BUTTONS --- */}
              <div className="md:col-span-2 flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Thêm máy bay
                </button>
              </div>
            </form>



          </div>
        </div>

      )}

      {/* Update Aircraft Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cập nhật thông tin máy bay
            </h3>
            {/* Form update */}
            {selectedId && (
              <form
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  updateAircraft();
                }}
              >
                {/* --- Mã máy bay --- */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Mã máy bay
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={aircraftUpdateData.aircraftCode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  />
                </div>

                {/* --- Model --- */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    value={aircraftUpdateData.model}
                    onChange={(e) => {
                      handleChange("model", e.target.value),
                        setUpdateErrors((prev: any) => ({ ...prev, model: "" }))
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  />
                  {updateErrors.model && (
                    <p className="text-red-500 text-sm mt-1">{updateErrors.model}</p>
                  )}
                </div>
                {/* --- Bố trí ghế --- */}
                <div className="md:col-span-2 border-t pt-4">
                  {/* <h4 className="text-md font-medium text-gray-700 mb-1">Bố trí ghế</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {(["Economy", "Business", "First"] as const).map((cls) => (
                      <input
                        key={cls}
                        type="text"
                        placeholder={`${cls} (VD: ${
                          cls === "Economy" ? "3-3-3" : cls === "Business" ? "2-2-2" : "1-2-1"
                        })`}
                        value={aircraftUpdateData.seatLayoutJSON.layout[cls] || ""}
                        onChange={(e) => handleSeatLayoutChange(cls, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      />
                    ))}
                  </div> */}

                  {/* --- Tiện ích --- */}
                  <div className="flex items-center gap-4 mt-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={aircraftUpdateData.seatLayoutJSON.hasWiFi}
                        onChange={(e) =>
                          setAircraftUpdateData((prev) => ({
                            ...prev,
                            seatLayoutJSON: {
                              ...prev.seatLayoutJSON,
                              hasWiFi: e.target.checked,
                            },
                          }))
                        }
                      />
                      <span className="text-md font-medium text-gray-700">Có WiFi</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={aircraftUpdateData.seatLayoutJSON.hasPremiumEntertainment}
                        onChange={(e) =>
                          setAircraftUpdateData((prev) => ({
                            ...prev,
                            seatLayoutJSON: {
                              ...prev.seatLayoutJSON,
                              hasPremiumEntertainment: e.target.checked,
                            },
                          }))
                        }
                      />
                      <span className="text-md font-medium text-gray-700">
                        Giải trí cao cấp
                      </span>
                    </label>
                  </div>
                </div>

                {/* --- Bảo trì --- */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Ngày bảo trì gần nhất
                  </label>
                  <input
                    type="date"
                    value={aircraftUpdateData.lastMaintenance}
                    onChange={(e) => handleChange("lastMaintenance", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  />
                </div>

                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Ngày bảo trì tiếp theo
                  </label>
                  <input
                    type="date"
                    value={aircraftUpdateData.nextMaintenance}
                    onChange={(e) => handleChange("nextMaintenance", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  />
                </div>

                {/* --- Trạng thái --- */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={aircraftUpdateData.isActive ? "true" : "false"}
                    onChange={(e) =>
                      handleChange("isActive", e.target.value === "true")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  >
                    <option value="true">Đang hoạt động</option>
                    <option value="false">Ngưng hoạt động</option>
                  </select>
                </div>

                {/* --- Buttons --- */}
                <div className="md:col-span-2 flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowUpdateModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Cập nhật thông tin
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}


    </div>
  );
}