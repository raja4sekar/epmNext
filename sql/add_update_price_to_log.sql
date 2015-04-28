drop trigger "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.sql/add_update_price_to_log";
CREATE TRIGGER "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.sql/add_update_price_to_log"
    AFTER UPDATE ON "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::MD.Products" 
    REFERENCING NEW ROW newrow, OLD ROW oldrow FOR EACH ROW
 BEGIN

   declare lv_price_difference decimal(15,2) := 0;
   if :oldrow.price <> :newrow.price then
    
      lv_price_difference := :newrow.price - :oldrow.price;
 
      INSERT INTO "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::MD.productLog" 
              VALUES(:newrow.PRODUCTID, now(), 
                    (select IFNULL(MAX(logid), 0) + 1 
                       from "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::MD.productLog" 
                          where productid = :newrow.PRODUCTID),
                   CURRENT_USER,
                   :newrow.PRODUCTID || ' has been updated with price difference of ' ||
                    to_decimal(lv_price_difference, 15, 2));
   end if;

 END;

UPDATE "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::MD.Products" 
                  SET PRICE = 349.00 WHERE PRODUCTID = 'ProductA';

--select PRODUCTID, CATEGORY, PRICE from "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::MD.Products"
--          where PRODUCTID = 'ProductA';
--select * from "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::MD.productLog";
